const { getDb } = require('../db/connection');

/**
 * 建立採購單（手動）
 */
function create({ supplier_id, items }) {
  const db = getDb();

  const doCreate = db.transaction(() => {
    const today = new Date().toISOString().slice(0, 10);
    const result = db.prepare(`
      INSERT INTO purchase_order (supplier_id, order_date, status)
      VALUES (?, ?, 'ordered')
    `).run(supplier_id, today);

    const poId = result.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO purchase_order_item (po_id, ingredient_id, ordered_qty, unit_price)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(poId, item.ingredient_id, item.ordered_qty, item.unit_price);
    }

    return poId;
  });

  return doCreate();
}

/**
 * 自動補貨：低於安全庫存的食材按供應商分組產生採購單
 */
function autoRestock() {
  const db = getDb();

  // 取得所有低庫存食材，按供應商分組
  const lowStockItems = db.prepare(`
    SELECT i.*, s.name as supplier_name, i.safety_stock - i.stock_qty as suggested_qty
    FROM ingredient i
    JOIN supplier s ON i.supplier_id = s.supplier_id
    WHERE i.stock_qty < i.safety_stock
    ORDER BY s.supplier_id
  `).all();

  if (lowStockItems.length === 0) return [];

  // 依供應商分組
  const groups = {};
  for (const item of lowStockItems) {
    if (!groups[item.supplier_id]) {
      groups[item.supplier_id] = { supplier_id: item.supplier_id, supplier_name: item.supplier_name, items: [] };
    }
    groups[item.supplier_id].items.push({
      ingredient_id: item.ingredient_id,
      ordered_qty: Math.ceil(item.suggested_qty * 1.2), // 補到安全庫存量的 1.2 倍
      unit_price: item.cost_per_unit || 0
    });
  }

  const poIds = [];
  for (const group of Object.values(groups)) {
    const poId = create({ supplier_id: group.supplier_id, items: group.items });
    poIds.push(poId);
  }

  return poIds;
}

function getAll() {
  const db = getDb();
  return db.prepare(`
    SELECT po.*, s.name as supplier_name
    FROM purchase_order po
    JOIN supplier s ON po.supplier_id = s.supplier_id
    ORDER BY po.created_at DESC
  `).all();
}

function getById(id) {
  const db = getDb();
  const po = db.prepare(`
    SELECT po.*, s.name as supplier_name
    FROM purchase_order po
    JOIN supplier s ON po.supplier_id = s.supplier_id
    WHERE po.po_id = ?
  `).get(id);

  if (!po) return null;

  po.items = db.prepare(`
    SELECT poi.*, i.name as ingredient_name, i.unit
    FROM purchase_order_item poi
    JOIN ingredient i ON poi.ingredient_id = i.ingredient_id
    WHERE poi.po_id = ?
  `).all(id);

  return po;
}

/**
 * 驗貨（transaction）
 */
function receive(id, items) {
  const db = getDb();
  const po = db.prepare(`SELECT * FROM purchase_order WHERE po_id = ?`).get(id);
  if (!po) {
    const err = new Error('採購單不存在');
    err.statusCode = 404;
    throw err;
  }

  const doReceive = db.transaction(() => {
    const updateItem = db.prepare(`
      UPDATE purchase_order_item
      SET received_qty = ?, is_qualified = ?, reject_reason = ?
      WHERE po_item_id = ?
    `);

    const updateStock = db.prepare(`
      UPDATE ingredient SET stock_qty = stock_qty + ? WHERE ingredient_id = ?
    `);

    let totalAmount = 0;
    let allQualified = true;
    let allNull = true;

    for (const item of items) {
      const poItem = db.prepare(`SELECT * FROM purchase_order_item WHERE po_item_id = ?`).get(item.po_item_id);
      if (!poItem) {
        const err = new Error(`採購明細 po_item_id=${item.po_item_id} 不存在`);
        err.statusCode = 400;
        throw err;
      }

      updateItem.run(
        item.received_qty || item.ordered_qty,
        item.is_qualified,
        item.reject_reason || null,
        item.po_item_id
      );

      if (item.is_qualified === 1) {
        const qualifiedQty = item.received_qty || item.ordered_qty;
        updateStock.run(qualifiedQty, poItem.ingredient_id);
        totalAmount += qualifiedQty * poItem.unit_price;
      }

      if (item.is_qualified !== 1) allQualified = false;
      if (item.is_qualified !== null) allNull = false;
    }

    // 更新採購單狀態
    let status;
    if (allNull) status = 'ordered';
    else if (allQualified) status = 'received';
    else status = 'partial';

    db.prepare(`UPDATE purchase_order SET status = ?, total_amount = ? WHERE po_id = ?`).run(status, totalAmount, id);
  });

  doReceive();
  return getById(id);
}

function getReturns(id) {
  const db = getDb();
  return db.prepare(`
    SELECT poi.*, i.name as ingredient_name, i.unit
    FROM purchase_order_item poi
    JOIN ingredient i ON poi.ingredient_id = i.ingredient_id
    WHERE poi.po_id = ? AND poi.is_qualified = 0
  `).all(id);
}

module.exports = { create, autoRestock, getAll, getById, receive, getReturns };