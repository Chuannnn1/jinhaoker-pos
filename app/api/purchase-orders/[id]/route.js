import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/purchase-orders/[id]
export async function GET(req, { params }) {
  try {
    const id = Number(params.id)
    const db = getDb()
    const po = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_order po LEFT JOIN supplier s ON po.supplier_id = s.supplier_id
      WHERE po.po_id = ?
    `).get(id)
    if (!po) return NextResponse.json({ success: false, error: '採購單不存在' }, { status: 404 })

    const items = db.prepare(`
      SELECT poi.*, i.name as ingredient_name, i.unit
      FROM purchase_order_item poi JOIN ingredient i ON poi.ingredient_id = i.ingredient_id
      WHERE poi.po_id = ?
    `).all(id)

    return NextResponse.json({ success: true, data: { ...po, items } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/purchase-orders/[id]/receive
export async function POST(req, { params }) {
  try {
    const id = Number(params.id)
    const { items } = await req.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'items 為必填' }, { status: 400 })
    }

    const db = getDb()
    const po = db.prepare('SELECT * FROM purchase_order WHERE po_id = ?').get(id)
    if (!po) return NextResponse.json({ success: false, error: '採購單不存在' }, { status: 404 })

    const receiveGoods = db.transaction(() => {
      for (const item of items) {
        db.prepare(`
          UPDATE purchase_order_item SET received_qty = ?, is_qualified = ?, reject_reason = ?, unit_cost = ?
          WHERE po_id = ? AND ingredient_id = ?
        `).run(item.received_qty, item.is_qualified ?? 1, item.reject_reason || null, item.unit_cost || 0, id, item.ingredient_id)

        if (item.is_qualified !== 0) {
          db.prepare('UPDATE ingredient SET stock_qty = stock_qty + ?, updated_at = datetime(?), unit = unit WHERE ingredient_id = ?')
            .run(item.received_qty, 'now', item.ingredient_id)
        }
      }

      // 更新採購單狀態
      db.prepare("UPDATE purchase_order SET status = 'received', updated_at = datetime('now','+8 hours') WHERE po_id = ?").run(id)
    })

    receiveGoods()
    const updated = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_order po LEFT JOIN supplier s ON po.supplier_id = s.supplier_id
      WHERE po.po_id = ?
    `).get(id)
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}