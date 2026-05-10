import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/inventory
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const lowStock = searchParams.get('low_stock')
    const db = getDb()

    let items
    if (lowStock === 'true') {
      items = db.prepare(`
        SELECT i.*, s.name as supplier_name
        FROM ingredient i LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
        WHERE i.is_active = 1 AND i.stock_qty <= i.low_stock_threshold
        ORDER BY (CAST(i.stock_qty AS REAL) / CAST(i.low_stock_threshold AS REAL)) ASC
      `).all()
    } else {
      items = db.prepare(`
        SELECT i.*, s.name as supplier_name
        FROM ingredient i LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
        WHERE i.is_active = 1 ORDER BY i.name
      `).all()
    }

    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// GET /api/inventory/check
export async function POST(req) {
  try {
    const body = await req.json()
    const { name, unit, supplier_id } = body
    if (!name) return NextResponse.json({ success: false, error: 'name 為必填' }, { status: 400 })

    const db = getDb()
    const result = db.prepare('INSERT INTO ingredient (name, unit, supplier_id) VALUES (?, ?, ?)').run(name, unit || 'kg', supplier_id || null)
    return NextResponse.json({ success: true, data: { ingredient_id: Number(result.lastInsertRowid) } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}