import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/menu/[id]
export async function GET(req, { params }) {
  try {
    const db = getDb()
    const id = Number(params.id)
    
    const item = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(id)
    if (!item) return NextResponse.json({ success: false, error: '餐點不存在' }, { status: 404 })

    const recipe = db.prepare(`
      SELECT r.*, i.name as ingredient_name, i.unit
      FROM recipe r JOIN ingredient i ON r.ingredient_id = i.ingredient_id
      WHERE r.item_id = ?
    `).all(id)

    return NextResponse.json({ success: true, data: { ...item, recipe } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PUT /api/menu/[id]
export async function PUT(req, { params }) {
  try {
    const id = Number(params.id)
    const db = getDb()
    const body = await req.json()
    const { name, category, price, description, image_url, is_active, recipe } = body

    const existing = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(id)
    if (!existing) return NextResponse.json({ success: false, error: '餐點不存在' }, { status: 404 })

    db.prepare(`
      UPDATE menu_item SET name=?, category=?, price=?, description=?, image_url=?, is_active=?, updated_at=datetime('now','+8 hours')
      WHERE item_id=?
    `).run(
      name || existing.name,
      category || existing.category,
      price ?? existing.price,
      description !== undefined ? description : existing.description,
      image_url !== undefined ? image_url : existing.image_url,
      is_active ?? existing.is_active,
      id
    )

    if (recipe && Array.isArray(recipe)) {
      db.prepare('DELETE FROM recipe WHERE item_id = ?').run(id)
      const insertRecipe = db.prepare('INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (?, ?, ?)')
      for (const r of recipe) {
        insertRecipe.run(id, r.ingredient_id, r.consume_qty)
      }
    }

    const updated = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(id)
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/menu/[id]
export async function DELETE(req, { params }) {
  try {
    const id = Number(params.id)
    const db = getDb()
    const existing = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(id)
    if (!existing) return NextResponse.json({ success: false, error: '餐點不存在' }, { status: 404 })

    db.prepare("UPDATE menu_item SET is_active = 0, updated_at = datetime('now','+8 hours') WHERE item_id = ?").run(id)
    return NextResponse.json({ success: true, data: { message: '已下架' } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}