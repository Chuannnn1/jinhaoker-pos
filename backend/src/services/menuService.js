const { getDb } = require('../db/connection');

/**
 * 取得所有上架中餐點
 * @param {string} [category] - 選填分類篩選
 */
function getAll(category) {
  const db = getDb();
  let sql = `SELECT * FROM menu_item WHERE is_active = 1`;
  const params = [];

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY sort_order ASC, name ASC`;
  return db.prepare(sql).all(...params);
}

/**
 * 取得所有分類（含各分類品項數）
 */
function getCategories() {
  const db = getDb();
  return db.prepare(`
    SELECT category, COUNT(*) as count
    FROM menu_item
    WHERE is_active = 1 AND category IS NOT NULL
    GROUP BY category
    ORDER BY category
  `).all();
}

/**
 * 取得單一餐點（含食譜）
 */
function getById(id) {
  const db = getDb();
  const item = db.prepare(`SELECT * FROM menu_item WHERE item_id = ?`).get(id);
  if (!item) return null;

  item.recipe = db.prepare(`
    SELECT r.ingredient_id, i.name as ingredient_name, i.unit, r.consume_qty
    FROM recipe r
    JOIN ingredient i ON r.ingredient_id = i.ingredient_id
    WHERE r.item_id = ?
  `).all(id);

  return item;
}

/**
 * 新增餐點（含食譜，transaction）
 */
function create({ name, category, price, description, image_url, recipe }) {
  const db = getDb();

  const insertItem = db.prepare(`
    INSERT INTO menu_item (name, category, price, description, image_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertRecipe = db.prepare(`
    INSERT INTO recipe (item_id, ingredient_id, consume_qty)
    VALUES (?, ?, ?)
  `);

  const doCreate = db.transaction(() => {
    const result = insertItem.run(name, category || null, price, description || null, image_url || null);
    const itemId = result.lastInsertRowid;

    if (recipe && recipe.length > 0) {
      for (const r of recipe) {
        insertRecipe.run(itemId, r.ingredient_id, r.consume_qty);
      }
    }

    return itemId;
  });

  return doCreate();
}

/**
 * 更新餐點（含食譜，transaction）
 */
function update(id, { name, category, price, description, image_url, is_active, recipe }) {
  const db = getDb();

  const updateItem = db.prepare(`
    UPDATE menu_item
    SET name = ?, category = ?, price = ?, description = ?, image_url = ?,
        is_active = ?, updated_at = datetime('now', 'localtime')
    WHERE item_id = ?
  `);

  const deleteRecipe = db.prepare(`DELETE FROM recipe WHERE item_id = ?`);
  const insertRecipe = db.prepare(`INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (?, ?, ?)`);

  const doUpdate = db.transaction(() => {
    const result = updateItem.run(
      name, category || null, price, description || null, image_url || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    );

    if (recipe !== undefined) {
      deleteRecipe.run(id);
      for (const r of recipe) {
        insertRecipe.run(id, r.ingredient_id, r.consume_qty);
      }
    }

    return result.changes > 0;
  });

  return doUpdate();
}

/**
 * 軟刪除（下架）
 */
function softDelete(id) {
  const db = getDb();
  const result = db.prepare(`UPDATE menu_item SET is_active = 0, updated_at = datetime('now', 'localtime') WHERE item_id = ?`).run(id);
  return result.changes > 0;
}

module.exports = { getAll, getCategories, getById, create, update, softDelete };