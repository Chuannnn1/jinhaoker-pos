const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// GET /api/orders — 取得訂單列表
router.get('/', (req, res, next) => {
  try {
    const { status, date, limit, offset } = req.query;
    const orders = orderService.getAll({ status, date, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

// GET /api/orders/stats — 訂單統計（儀表板用）
router.get('/stats', (req, res, next) => {
  try {
    const stats = orderService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
});

// GET /api/orders/:id — 取得單筆訂單
router.get('/:id', (req, res, next) => {
  try {
    const order = orderService.getById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: '訂單不存在' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// POST /api/orders — 建立訂單
router.post('/', (req, res, next) => {
  try {
    const { customer_name, customer_phone, note, items } = req.body;
    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'customer_name 和 items 為必填欄位' });
    }
    const orderId = orderService.create({ customer_name, customer_phone, note, items });
    res.status(201).json({ success: true, data: { order_id: orderId } });
  } catch (err) { next(err); }
});

// PUT /api/orders/:id — 修改訂單（僅 pending）
router.put('/:id', (req, res, next) => {
  try {
    const { customer_name, customer_phone, note, items } = req.body;
    const order = orderService.update(req.params.id, { customer_name, customer_phone, note, items });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/status — 更新訂單狀態
router.patch('/:id/status', (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'status 為必填' });
    const order = orderService.updateStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

module.exports = router;