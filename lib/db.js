import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/jinhaoker.db')

let _db = null

export function getDb() {
  if (!_db) {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
  }
  return _db
}

// 取得訂單 ID（格式：YYYYMMDDXXXX）
export function generateOrderId() {
  const db = getDb()
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const row = db.prepare(`
    SELECT COALESCE(MAX(CAST(SUBSTR(order_id, 9) AS INTEGER)), 0) + 1 as next
    FROM "order"
    WHERE order_id LIKE ?
  `).get(dateStr + '%')
  return dateStr + String(row.next).padStart(4, '0')
}

export default getDb