import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/purchase-orders/[id]/returns
export async function GET(req, { params }) {
  try {
    const id = Number(params.id)
    const db = getDb()
    const items = db.prepare(`
      SELECT poi.*, i.name as ingredient_name
      FROM purchase_order_item poi JOIN ingredient i ON poi.ingredient_id = i.ingredient_id
      WHERE poi.po_id = ? AND poi.is_qualified = 0
    `).all(id)
    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}