import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/menu/categories
export async function GET() {
  try {
    const db = getDb()
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count FROM menu_item WHERE is_active = 1 GROUP BY category
    `).all()
    return NextResponse.json({ success: true, data: categories })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}