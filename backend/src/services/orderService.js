const { getDb } = require('../db/connection');
const { generateOrderId } = require('../utils/orderIdGenerator');

/**
 * 取得訂單列表
 */
function getAll({ status, date, limit = 50, offset = 0 }) {
  const db = getDb();
  let sql = `SELECT o.* FROM "order" o WHERE 1=1`;
  const params = [];

  if (status) {
    sql += ` AND o.status = ?`;
    params.push(status);
  }
  if (date) {
    sql += ` AND o.order_date = ?`;
    params.push(date);
  }

  sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return db.prepare(sql).all(...params);
}

/**
 * 取得單筆訂單（含明細）
 */
function getById(id) {
  const db = getDb();
  const order = db.prepare(`SELECT * FROM "order" WHERE order_id = ?`).get(id);
  if (!order) return null;

  order.items = db.prepare(`
    SELECT oi.*, mi.name as item_name, mi.price as unit_price
    FROM order_item oi
    JOIN menu_item mi ON oi.item_id = mi.item_id
    WHERE oi.order_id = ?
  `).all(id);

  return order;
}

/**
 * 檢查食材庫存是否足夠
 * @returns {{ ok: boolean, errors: string[] }}
 */
function checkInventory(items) {
  const db = getDb();
  const errors = [];

  for (const item of items) {
    const recipes = db.prepare(`
      SELECT r.*, i.name as ingredient_name, i.stock_qty
      FROM recipe r
      JOIN ingredient i ON r.ingredient_id = i.ingredient_id
      WHERE r.item_id = ?
    `).all(item.item_id);

    for (const r of recipes) {
      const needed = r.consume_qty * item.quantity;
      if (r.stock_qty < needed) {
        errors.push(`食材「${r.ingredient_name}」庫存不足：需要 ${needed} ${r.unit}，目前剩 ${r.stock_qty} ${r.unit}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * 扣除食材庫存（內部用，須包在 transaction 內）
 */
function deductInventory(items) {
  const db = getDb();
  const deduct = db.prepare(`UPDATE ingredient SET stock_qty = stock_qty - ? WHERE ingredient_id = ?`);

  for (const item of items) {
    const recipes = db.prepare(`SELECT * FROM recipe WHERE item_id = ?`).all(item.item_id);
    for (const r of recipes) {
      deduct.run(r.consume_qty * item.quantity, r.ingredient_id);
    }
  }
}

/**
 * 回補食材庫存（取消訂單用）
 */
function restoreInventory(orderItems) {
  const db = getDb();
  const restore = db.prepare(`UPDATE ingredient SET stock_qty = stock_qty + ? WHERE ingredient_id = ?`);

  for (const oi of orderItems) {
    const recipes = db.prepare(`SELECT * FROM recipe WHERE item_id = ?`).all(oi.item_id);
    for (const r of recipes) {
      restore.run(r.consume_qty * oi.quantity, r.ingredient_id);
    }
  }
}

/**
 * 建立訂單（transaction）
 */
function create({ customer_name, customer_phone, note, items }) {
  const db = getDb();

  // 先檢查所有 item 是否存在且上架
  for (const item of items) {
    const menuItem = db.prepare(`SELECT * FROM menu_item WHERE item_id = ? AND is_active = 1`).get(item.item_id);
    if (!menuItem) {
      const err = new Error(`餐點 item_id=${item.item_id} 不存在或已下架`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 檢查庫存
  const { ok, errors } = checkInventory(items);
  if (!ok) {
    const err = new Error(errors.join('；'));
    err.statusCode = 400;
    throw err;
  }

  const doCreate = db.transaction(() => {
    const orderId = generateOrderId();
    const today = new Date().toISOString().slice(0, 10);

    // 計算總金額
    let totalAmount = 0;
    const itemDetails = [];
    for (const item of items) {
      const menuItem = db.prepare(`SELECT * FROM menu_item WHERE item_id = ?`).get(item.item_id);
      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      itemDetails.push({ ...item, subtotal });
    }

    // 寫入訂單
    db.prepare(`
      INSERT INTO "order" (order_id, order_date, customer_name, customer_phone, note, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(orderId, today, customer_name, customer_phone || null, note || null, totalAmount);

    // 寫入明細 + 扣庫存
    const insertItem = db.prepare(`
      INSERT INTO order_item (order_id, item_id, quantity, subtotal, customization)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of itemDetails) {
      insertItem.run(orderId, item.item_id, item.quantity, item.subtotal, item.customization || null);
    }

    deductInventory(items);

    return orderId;
  });

  return doCreate();
}

/**
 * 更新訂單（僅 pending 狀態可改，transaction）
 */
function update(id, { customer_name, customer_phone, note, items }) {
  const db = getDb();
  const order = db.prepare(`SELECT * FROM "order" WHERE order_id = ?`).get(id);
  if (!order) {
    const err = new Error('訂單不存在');
    err.statusCode = 404;
    throw err;
  }
  if (order.status !== 'pending') {
    const err = new Error('只有 pending 狀態的訂單可以修改');
    err.statusCode = 400;
    throw err;
  }

  // 檢查新庫存
  const { ok, errors } = checkInventory(items);
  if (!ok) {
    const err = new Error(errors.join('；'));
    err.statusCode = 400;
    throw err;
  }

  const doUpdate = db.transaction(() => {
    // 回補舊訂單庫存
    const oldItems = db.prepare(`SELECT * FROM order_item WHERE order_id = ?`).all(id);
    restoreInventory(oldItems);

    // 刪除舊明細
    db.prepare(`DELETE FROM order_item WHERE order_id = ?`).run(id);

    // 計算新總金額
    let totalAmount = 0;
    const insertItem = db.prepare(`
      INSERT INTO order_item (order_id, item_id, quantity, subtotal, customization)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const menuItem = db.prepare(`SELECT * FROM menu_item WHERE item_id = ?`).get(item.item_id);
      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      insertItem.run(id, item.item_id, item.quantity, subtotal, item.customization || null);
    }

    // 扣新庫存
    deductInventory(items);

    // 更新訂單
    db.prepare(`
      UPDATE "order" SET customer_name = ?, customer_phone = ?, note = ?,
        total_amount = ?, updated_at = datetime('now', 'localtime')
      WHERE order_id = ?
    `).run(customer_name, customer_phone || null, note || null, totalAmount, id);
  });

  doUpdate();
  return getById(id);
}

/**
 * 更新訂單狀態
 */
function updateStatus(id, status) {
  const db = getDb();
  const order = db.prepare(`SELECT * FROM "order" WHERE order_id = ?`).get(id);
  if (!order) {
    const err = new Error('訂單不存在');
    err.statusCode = 404;
    throw err;
  }

  const validTransitions = {
    pending: ['cooking', 'cancelled'],
    cooking: ['delivering', 'cancelled'],
    delivering: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[order.status].includes(status)) {
    const err = new Error(`無法從 ${order.status} 轉換到 ${status}`);
    err.statusCode = 400;
    throw err;
  }

  if (status === 'cancelled') {
    const doCancel = db.transaction(() => {
      const orderItems = db.prepare(`SELECT * FROM order_item WHERE order_id = ?`).all(id);
      restoreInventory(orderItems);
      db.prepare(`UPDATE "order" SET status = ?, updated_at = datetime('now', 'localtime') WHERE order_id = ?`).run(status, id);
    });
    doCancel();
  } else {
    db.prepare(`UPDATE "order" SET status = ?, updated_at = datetime('now', 'localtime') WHERE order_id = ?`).run(status, id);
  }

  return getById(id);
}

/**
 * 取得訂單統計（儀表板用）
 */
function getStats() {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const todayStats = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as completed_revenue
    FROM "order"
    WHERE order_date = ?
  `).get(today);

  // 最近 7 天營收
  const weeklyRevenue = db.prepare(`
    SELECT order_date as date, SUM(total_amount) as revenue
    FROM "order"
    WHERE order_date >= date('now', '-6 days', 'localtime')
      AND status != 'cancelled'
    GROUP BY order_date
    ORDER BY order_date ASC
  `).all();

  // 熱門品項
  const popularItems = db.prepare(`
    SELECT mi.name, SUM(oi.quantity) as total_ordered
    FROM order_item oi
    JOIN menu_item mi ON oi.item_id = mi.item_id
    JOIN "order" o ON oi.order_id = o.order_id
    WHERE o.order_date = ?
    GROUP BY mi.name
    ORDER BY total_ordered DESC
    LIMIT 5
  `).all(today);

  return { todayStats, weeklyRevenue, popularItems };
}

module.exports = { getAll, getById, create, update, updateStatus, getStats };