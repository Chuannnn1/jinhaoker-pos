const express = require('express');
const router = express.Router();
const purchaseService = require('../services/purchaseService');

router.get('/', (req, res, next) => {
  try {
    const pos = purchaseService.getAll();
    res.json({ success: true, data: pos });
  } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try {
    const po = purchaseService.getById(Number(req.params.id));
    if (!po) return res.status(404).json({ success: false, error: '採購單不存在' });
    res.json({ success: true, data: po });
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    let poIds;
    if (req.body.auto_restock) {
      poIds = purchaseService.autoRestock();
    } else {
      const { supplier_id, items } = req.body;
      if (!supplier_id || !items) {
        return res.status(400).json({ success: false, error: 'supplier_id 和 items 為必填，或使用 auto_restock' });
      }
      const poId = purchaseService.create({ supplier_id, items });
      poIds = [poId];
    }
    res.status(201).json({ success: true, data: { po_ids: poIds } });
  } catch (err) { next(err); }
});

router.post('/:id/receive', (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items) return res.status(400).json({ success: false, error: 'items 為必填' });
    const po = purchaseService.receive(Number(req.params.id), items);
    res.json({ success: true, data: po });
  } catch (err) { next(err); }
});

router.get('/:id/returns', (req, res, next) => {
  try {
    const returns = purchaseService.getReturns(Number(req.params.id));
    res.json({ success: true, data: returns });
  } catch (err) { next(err); }
});

module.exports = router;