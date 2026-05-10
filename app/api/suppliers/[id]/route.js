import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// PUT /api/suppliers/[id]
export async function PUT(req, { params }) {
  try {
    const id = Number(params.id)
    const { name, phone, address } = await req.json()
    const db = getDb()

    const existing = db.prepare('SELECT * FROM supplier WHERE supplier_id = ?').get(id)
    if (!existing) return NextResponse.json({ success: false, error: '供應商不存在' }, { status: 404 })

    db.prepare("UPDATE supplier SET name = ?, phone = ?, address = ?, updated_at = datetime('now','+8 hours') WHERE supplier_id = ?")
      .run(name || existing.name, phone !== undefined ? phone : existing.phone, address !== undefined ? address : existing.address, id)

    const updated = db.prepare('SELECT * FROM supplier WHERE supplier_id = ?').get(id)
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}