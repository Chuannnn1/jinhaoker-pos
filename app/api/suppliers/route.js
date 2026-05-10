import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/suppliers
export async function GET() {
  try {
    const db = getDb()
    const suppliers = db.prepare(`
      SELECT s.*, COUNT(i.ingredient_id) as ingredient_count
      FROM supplier s LEFT JOIN ingredient i ON s.supplier_id = i.supplier_id
      WHERE s.is_active = 1
      GROUP BY s.supplier_id
      ORDER BY s.name
    `).all()
    return NextResponse.json({ success: true, data: suppliers })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/suppliers
export async function POST(req) {
  try {
    const { name, phone, address } = await req.json()
    if (!name) return NextResponse.json({ success: false, error: 'name 為必填' }, { status: 400 })

    const db = getDb()
    const result = db.prepare('INSERT INTO supplier (name, phone, address) VALUES (?, ?, ?)').run(name, phone || null, address || null)
    return NextResponse.json({ success: true, data: { supplier_id: Number(result.lastInsertRowid) } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}