import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// PATCH /api/orders/[id]/status
export async function PATCH(req, { params }) {
  try {
    const { status } = await req.json()
    if (!status) return NextResponse.json({ success: false, error: 'status 為必填' }, { status: 400 })

    const db = getDb()
    const order = db.prepare('SELECT * FROM "order" WHERE order_id = ?').get(params.id)
    if (!order) return NextResponse.json({ success: false, error: '訂單不存在' }, { status: 404 })

    const validTransitions = {
      pending: ['cooking', 'cancelled'],
      cooking: ['delivering', 'cancelled'],
      delivering: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    }

    if (!validTransitions[order.status].includes(status)) {
      return NextResponse.json({
        success: false,
        error: `無法從 ${order.status} 轉換到 ${status}（有效轉換：${validTransitions[order.status].join('、') || '無'}）`
      }, { status: 400 })
    }

    if (status === 'cancelled') {
      // 回補庫存（transaction）
      db.transaction(() => {
        const items = db.prepare('SELECT * FROM order_item WHERE order_id = ?').all(params.id)
        for (const oi of items) {
          const recipeItems = db.prepare('SELECT * FROM recipe WHERE item_id = ?').all(oi.item_id)
          for (const r of recipeItems) {
            db.prepare('UPDATE ingredient SET stock_qty = stock_qty + ? WHERE ingredient_id = ?').run(r.consume_qty * oi.quantity, r.ingredient_id)
          }
        }
        db.prepare("UPDATE \"order\" SET status = ?, updated_at = datetime('now','+8 hours') WHERE order_id = ?").run(status, params.id)
      })()
    } else {
      db.prepare("UPDATE \"order\" SET status = ?, updated_at = datetime('now','+8 hours') WHERE order_id = ?").run(status, params.id)
    }

    const updated = db.prepare('SELECT * FROM "order" WHERE order_id = ?').get(params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}