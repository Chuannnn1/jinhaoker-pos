const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const suppliers = db.prepare(`
      SELECT s.*, COUNT(i.ingredient_id) as ingredient_count
      FROM supplier s
      LEFT JOIN ingredient i ON s.supplier_id = i.supplier_id
      GROUP BY s.supplier_id
      ORDER BY s.name ASC
    `).all();
    res.json({ success: true, data: suppliers });
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name 為必填' });
    const db = getDb();
    const result = db.prepare(`INSERT INTO supplier (name, phone) VALUES (?, ?)`).run(name, phone || null);
    res.status(201).json({ success: true, data: { supplier_id: result.lastInsertRowid } });
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const db = getDb();
    const result = db.prepare(`UPDATE supplier SET name = ?, phone = ? WHERE supplier_id = ?`).run(name, phone || null, Number(req.params.id));
    if (result.changes === 0) return res.status(404).json({ success: false, error: '供應商不存在' });
    res.json({ success: true, data: { message: '已更新' } });
  } catch (err) { next(err); }
});

module.exports = router;