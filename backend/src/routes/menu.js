const express = require('express');
const router = express.Router();
const menuService = require('../services/menuService');

// GET /api/menu — 取得所有上架餐點（可選 ?category=）
router.get('/', (req, res, next) => {
  try {
    const { category } = req.query;
    const items = menuService.getAll(category);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

// GET /api/menu/categories — 取得所有分類
router.get('/categories', (req, res, next) => {
  try {
    const categories = menuService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

// GET /api/menu/:id — 取得單一品項（含食譜）
router.get('/:id', (req, res, next) => {
  try {
    const item = menuService.getById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: '餐點不存在' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

// POST /api/menu — 新增餐點
router.post('/', (req, res, next) => {
  try {
    const { name, category, price, description, image_url, recipe } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'name 和 price 為必填欄位' });
    }
    const itemId = menuService.create({ name, category, price, description, image_url, recipe });
    res.status(201).json({ success: true, data: { item_id: itemId } });
  } catch (err) { next(err); }
});

// PUT /api/menu/:id — 更新餐點
router.put('/:id', (req, res, next) => {
  try {
    const { name, category, price, description, image_url, is_active, recipe } = req.body;
    const ok = menuService.update(Number(req.params.id), { name, category, price, description, image_url, is_active, recipe });
    if (!ok) return res.status(404).json({ success: false, error: '餐點不存在' });
    res.json({ success: true, data: menuService.getById(Number(req.params.id)) });
  } catch (err) { next(err); }
});

// DELETE /api/menu/:id — 下架餐點
router.delete('/:id', (req, res, next) => {
  try {
    const ok = menuService.softDelete(Number(req.params.id));
    if (!ok) return res.status(404).json({ success: false, error: '餐點不存在' });
    res.json({ success: true, data: { message: '已下架' } });
  } catch (err) { next(err); }
});

module.exports = router;