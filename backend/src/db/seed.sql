-- ============================================================
-- 測試用初始資料 — 金濠客食堂
-- ============================================================

DELETE FROM purchase_order_item;
DELETE FROM purchase_order;
DELETE FROM order_item;
DELETE FROM "order";
DELETE FROM recipe;
DELETE FROM menu_item;
DELETE FROM ingredient;
DELETE FROM supplier;

-- 供應商
INSERT INTO supplier (name, phone) VALUES ('大成肉品', '05-2345678');
INSERT INTO supplier (name, phone) VALUES ('嘉義蔬果行', '05-3456789');
INSERT INTO supplier (name, phone) VALUES ('全聯食材供應', '05-4567890');

-- 食材
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('排骨', '斤', 20, 5, 150, 1);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('白米', '公斤', 50, 10, 40, 3);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('高麗菜', '顆', 30, 8, 35, 2);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('雞腿', '支', 40, 10, 45, 1);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('豬肉片', '斤', 25, 5, 130, 1);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('蛋', '顆', 100, 20, 5, 3);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('味噌', '包', 10, 3, 60, 3);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('豆腐', '塊', 20, 5, 15, 2);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('蔥', '把', 15, 4, 20, 2);
INSERT INTO ingredient (name, unit, stock_qty, safety_stock, cost_per_unit, supplier_id) VALUES ('醬油', '瓶', 5, 2, 80, 3);

-- 菜單品項（含 image_url 欄位）
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('招牌排骨飯', '主餐', 100, '手工醃製排骨搭配三樣配菜', 1);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('香煎雞腿飯', '主餐', 110, '現煎去骨雞腿', 2);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('豬肉片飯', '主餐', 90, '嫩煎豬肉片', 3);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('滷肉飯', '主餐', 40, '古早味滷肉', 4);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('味噌湯', '湯品', 30, '手工味噌湯', 1);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('蛋花湯', '湯品', 25, '新鮮蛋花湯', 2);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('荷包蛋', '加點', 15, '煎蛋一顆', 1);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('燙青菜', '加點', 30, '當季時蔬', 2);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('紅茶', '飲料', 20, '古早味紅茶', 1);
INSERT INTO menu_item (name, category, price, description, sort_order) VALUES ('綠茶', '飲料', 20, '無糖綠茶', 2);

-- 食譜
-- 招牌排骨飯
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (1, 1, 0.3);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (1, 2, 0.3);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (1, 3, 0.2);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (1, 6, 1);
-- 香煎雞腿飯
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (2, 4, 1);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (2, 2, 0.3);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (2, 3, 0.2);
-- 豬肉片飯
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (3, 5, 0.3);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (3, 2, 0.3);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (3, 3, 0.2);
-- 滷肉飯
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (4, 5, 0.15);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (4, 2, 0.3);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (4, 10, 0.02);
-- 味噌湯
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (5, 7, 0.1);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (5, 8, 0.5);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (5, 9, 0.1);
-- 蛋花湯
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (6, 6, 1);
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (6, 9, 0.1);
-- 荷包蛋
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (7, 6, 1);
-- 燙青菜
INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (8, 3, 0.3);

-- 測試訂單（已完成）
INSERT INTO "order" (order_id, order_date, created_at, updated_at, customer_name, total_amount, status)
VALUES ('202605100001', '2026-05-10', '2026-05-10 11:30:00', '2026-05-10 11:45:00', '王小明', 200, 'completed');
INSERT INTO order_item (order_id, item_id, quantity, subtotal) VALUES ('202605100001', 1, 2, 200);

INSERT INTO "order" (order_id, order_date, created_at, updated_at, customer_name, total_amount, status)
VALUES ('202605100002', '2026-05-10', '2026-05-10 12:00:00', '2026-05-10 12:20:00', '李小華', 170, 'completed');
INSERT INTO order_item (order_id, item_id, quantity, subtotal) VALUES ('202605100002', 2, 1, 110);
INSERT INTO order_item (order_id, item_id, quantity, subtotal) VALUES ('202605100002', 7, 1, 60);

INSERT INTO "order" (order_id, order_date, created_at, updated_at, customer_name, total_amount, status)
VALUES ('202605100003', '2026-05-10', '2026-05-10 12:15:00', '2026-05-10 12:15:00', '張大爺', 40, 'cooking');
INSERT INTO order_item (order_id, item_id, quantity, subtotal) VALUES ('202605100003', 4, 1, 40);

INSERT INTO "order" (order_id, order_date, created_at, updated_at, customer_name, total_amount, status)
VALUES ('202605100004', '2026-05-10', '2026-05-10 12:30:00', '2026-05-10 12:30:00', '陳小姐', 155, 'pending');
INSERT INTO order_item (order_id, item_id, quantity, subtotal) VALUES ('202605100004', 5, 2, 60);
INSERT INTO order_item (order_id, item_id, quantity, subtotal) VALUES ('202605100004', 6, 1, 25);
INSERT INTO order_item (order_id, item_id, quantity, subtotal) VALUES ('202605100004', 10, 1, 20);
INSERT INTO order_item (order_id, item_id, quantity, subtotal, customization) VALUES ('202605100004', 1, 1, 100, '不要辣');