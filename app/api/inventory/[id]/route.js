import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/inventory/[id]
export async function GET(req, { params }) {
  try {
    const id = Number(params.id)
    const db = getDb()
    const item = db.prepare(`
      SELECT i.*, s.name as supplier_name
      FROM ingredient i LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
      WHERE i.ingredient_id = ?
    `).get(id)
    if (!item) return NextResponse.json({ success: false, error: '食材不存在' }, { status: 404 })

    const usedIn = db.prepare(`
      SELECT m.item_id, m.name, r.consume_qty
      FROM recipe r JOIN menu_item m ON r.item_id = m.item_id
      WHERE r.ingredient_id = ?
    `).all(id)

    return NextResponse.json({ success: true, data: { ...item, usedIn } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PUT /api/inventory/[id]（調整庫存）
export async function PUT(req, { params }) {
  try {
    const id = Number(params.id)
    const { stock_qty } = await req.json()
    if (stock_qty === undefined) return NextResponse.json({ success: false, error: 'stock_qty 為必填' }, { status: 400 })

    const db = getDb()
    const existing = db.prepare('SELECT * FROM ingredient WHERE ingredient_id = ?').get(id)
    if (!existing) return NextResponse.json({ success: false, error: '食材不存在' }, { status: 404 })

    db.prepare("UPDATE ingredient SET stock_qty = ?, updated_at = datetime('now','+8 hours') WHERE ingredient_id = ?").run(stock_qty, id)
    const updated = db.prepare('SELECT * FROM ingredient WHERE ingredient_id = ?').get(id)
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}