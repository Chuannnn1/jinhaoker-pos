const fs = require('fs');
const path = require('path');
const { getDb, closeDb } = require('./connection');

function initDatabase() {
  const db = getDb();

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  console.log('✅ Schema 建立完成');

  const count = db.prepare('SELECT COUNT(*) as c FROM supplier').get();
  if (count.c === 0) {
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    db.exec(seed);
    console.log('✅ Seed 資料寫入完成');
  } else {
    console.log('ℹ️  資料庫已有資料，跳過 seed');
  }

  closeDb();
  console.log('✅ 資料庫初始化完成');
}

initDatabase();