import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/inventory/check
export async function GET() {
  try {
    const db = getDb()
    const lowStock = db.prepare(`
      SELECT i.*, s.name as supplier_name
      FROM ingredient i LEFT JOIN supplier s ON i.supplier_id = s.supplier_id
      WHERE i.is_active = 1 AND i.stock_qty <= i.low_stock_threshold
      ORDER BY (CAST(i.stock_qty AS REAL) / CAST(i.low_stock_threshold AS REAL)) ASC
    `).all()
    return NextResponse.json({ success: true, data: lowStock })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}