import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/purchase-orders
export async function GET() {
  try {
    const db = getDb()
    const pos = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_order po LEFT JOIN supplier s ON po.supplier_id = s.supplier_id
      ORDER BY po.created_at DESC
    `).all()
    return NextResponse.json({ success: true, data: pos })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/purchase-orders
export async function POST(req) {
  try {
    const body = await req.json()
    const { supplier_id, items, auto_restock } = body
    const db = getDb()

    const createPO = db.transaction(() => {
      let totalAmount = 0
      let poItems = []

      if (auto_restock) {
        // 自動補貨：低庫存的食材
        const lowStock = db.prepare(`
          SELECT i.*, COALESCE(supplier_id, 1) as sid FROM ingredient i
          WHERE i.is_active = 1 AND i.stock_qty <= i.low_stock_threshold
        `).all()
        for (const item of lowStock) {
          const orderQty = Math.ceil(item.low_stock_threshold * 3 - item.stock_qty)
          poItems.push({ ingredient_id: item.ingredient_id, ordered_qty: orderQty, unit_cost: 0 })
        }
      } else {
        poItems = items || []
      }

      if (poItems.length === 0) throw new Error('沒有需要採購的食材')

      const result = db.prepare('INSERT INTO purchase_order (supplier_id, total_amount, status, created_at, updated_at) VALUES (?, ?, ?, datetime(?), datetime(?))').run(supplier_id || null, totalAmount, 'pending', 'now', 'now')
      const poId = result.lastInsertRowid

      const insertItem = db.prepare('INSERT INTO purchase_order_item (po_id, ingredient_id, ordered_qty, unit_cost) VALUES (?, ?, ?, ?)')
      for (const pi of poItems) {
        insertItem.run(Number(poId), pi.ingredient_id, pi.ordered_qty, pi.unit_cost || 0)
        totalAmount += (pi.unit_cost || 0) * pi.ordered_qty
      }

      if (totalAmount > 0) db.prepare('UPDATE purchase_order SET total_amount = ? WHERE po_id = ?').run(totalAmount, Number(poId))

      return Number(poId)
    })

    const poId = createPO()
    return NextResponse.json({ success: true, data: { po_id: poId } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}