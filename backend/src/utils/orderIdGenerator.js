const { getDb } = require('../db/connection');

function generateOrderId() {
  const db = getDb();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const today = now.toISOString().slice(0, 10);

  const result = db.prepare(
    `SELECT COUNT(*) as count FROM "order" WHERE order_date = ?`
  ).get(today);

  const seq = (result.count + 1).toString().padStart(4, '0');
  return `${dateStr}${seq}`;
}

module.exports = { generateOrderId };