const { getDb } = require('../db/connection');

function getAll({ low_stock } = {}) {
  const db = getDb();
  let sql = `
    SELECT i.*, s.name as supplier_name,
      CASE WHEN i.stock_qty < i.safety_stock THEN 1 ELSE 0 END as is_low_stock,
      CASE WHEN i.stock_qty < i.safety_stock THEN i.safety_stock - i.stock_qty ELSE 0 END as suggested_order_qty
    FROM ingredient i
    LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
  `;

  if (low_stock === 'true' || low_stock === true) {
    sql += ` WHERE i.stock_qty < i.safety_stock`;
  }

  sql += ` ORDER BY i.name ASC`;
  return db.prepare(sql).all();
}

function getById(id) {
  const db = getDb();
  const ingredient = db.prepare(`
    SELECT i.*, s.name as supplier_name
    FROM ingredient i
    LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
    WHERE i.ingredient_id = ?
  `).get(id);

  if (!ingredient) return null;

  ingredient.used_in = db.prepare(`
    SELECT mi.item_id, mi.name, r.consume_qty
    FROM recipe r
    JOIN menu_item mi ON r.item_id = mi.item_id
    WHERE r.ingredient_id = ?
  `).all(id);

  return ingredient;
}

function updateStock(id, stock_qty) {
  const db = getDb();
  const result = db.prepare(`UPDATE ingredient SET stock_qty = ? WHERE ingredient_id = ?`).run(stock_qty, id);
  return result.changes > 0;
}

function checkLowStock() {
  const db = getDb();
  return db.prepare(`
    SELECT i.*, s.name as supplier_name,
      i.safety_stock - i.stock_qty as suggested_order_qty
    FROM ingredient i
    LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
    WHERE i.stock_qty < i.safety_stock
    ORDER BY (i.safety_stock - i.stock_qty) DESC
  `).all();
}

module.exports = { getAll, getById, updateStock, checkLowStock };