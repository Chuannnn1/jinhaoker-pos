const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');

router.get('/', (req, res, next) => {
  try {
    const items = inventoryService.getAll({ low_stock: req.query.low_stock });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.get('/check', (req, res, next) => {
  try {
    const lowStock = inventoryService.checkLowStock();
    res.json({ success: true, data: lowStock });
  } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try {
    const item = inventoryService.getById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: '食材不存在' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const { stock_qty } = req.body;
    if (stock_qty === undefined) return res.status(400).json({ success: false, error: 'stock_qty 為必填' });
    const ok = inventoryService.updateStock(Number(req.params.id), stock_qty);
    if (!ok) return res.status(404).json({ success: false, error: '食材不存在' });
    res.json({ success: true, data: { message: '已更新庫存' } });
  } catch (err) { next(err); }
});

module.exports = router;