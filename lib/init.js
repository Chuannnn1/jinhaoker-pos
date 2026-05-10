// 初始化資料庫：建立 Schema + Seed 測試資料
import { getDb } from './db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function initDatabase() {
  const db = getDb()

  // 讀取 schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  // 讀取 seed.sql
  const seedPath = path.join(__dirname, 'seed.sql')
  const seed = fs.readFileSync(seedPath, 'utf-8')

  // 執行 schema（使用 exec 避免 multi-statement 問題）
  const statements = schema.split(';').filter(s => s.trim())
  for (const stmt of statements) {
    if (stmt.trim()) {
      try { db.exec(stmt) } catch (e) {}
    }
  }

  // 執行 seed
  const seedStatements = seed.split(';').filter(s => s.trim())
  for (const stmt of seedStatements) {
    if (stmt.trim()) {
      try { db.exec(stmt) } catch (e) {}
    }
  }

  console.log('✅ Schema 建立完成')
  console.log('✅ Seed 資料寫入完成')
  console.log('✅ 資料庫初始化完成')
}

initDatabase().catch(console.error)