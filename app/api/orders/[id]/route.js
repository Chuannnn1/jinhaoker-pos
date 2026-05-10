import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/orders/[id]
export async function GET(req, { params }) {
  try {
    const db = getDb()
    const order = db.prepare('SELECT * FROM "order" WHERE order_id = ?').get(params.id)
    if (!order) return NextResponse.json({ success: false, error: '訂單不存在' }, { status: 404 })

    const items = db.prepare('SELECT * FROM order_item WHERE order_id = ?').all(params.id)
    return NextResponse.json({ success: true, data: { ...order, items } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PUT /api/orders/[id]（修改訂單 - 僅 pending 狀態可改）
export async function PUT(req, { params }) {
  try {
    const db = getDb()
    const order = db.prepare('SELECT * FROM "order" WHERE order_id = ?').get(params.id)
    if (!order) return NextResponse.json({ success: false, error: '訂單不存在' }, { status: 404 })
    if (order.status !== 'pending') return NextResponse.json({ success: false, error: '僅 pending 狀態的訂單可修改' }, { status: 400 })

    const { customer_name, customer_phone, note, items } = await req.json()

    const updateOrder = db.transaction(() => {
      // 回補舊庫存
      const oldItems = db.prepare('SELECT * FROM order_item WHERE order_id = ?').all(params.id)
      for (const oi of oldItems) {
        const recipeItems = db.prepare('SELECT * FROM recipe WHERE item_id = ?').all(oi.item_id)
        for (const r of recipeItems) {
          db.prepare('UPDATE ingredient SET stock_qty = stock_qty + ? WHERE ingredient_id = ?').run(r.consume_qty * oi.quantity, r.ingredient_id)
        }
      }

      // 刪除舊明細
      db.prepare('DELETE FROM order_item WHERE order_id = ?').run(params.id)

      // 更新訂單資訊
      if (customer_name) db.prepare('UPDATE "order" SET customer_name = ? WHERE order_id = ?').run(customer_name, params.id)
      if (customer_phone !== undefined) db.prepare('UPDATE "order" SET customer_phone = ? WHERE order_id = ?').run(customer_phone, params.id)
      if (note !== undefined) db.prepare('UPDATE "order" SET note = ? WHERE order_id = ?').run(note, params.id)

      // 重新計算金額
      let totalAmount = 0
      const orderItems = []
      const insertItem = db.prepare('INSERT INTO order_item (order_id, item_id, item_name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)')

      for (const item of items) {
        const menuItem = db.prepare('SELECT * FROM menu_item WHERE item_id = ? AND is_active = 1').get(item.item_id)
        if (!menuItem) throw new Error(`餐點 ID ${item.item_id} 不存在或已下架`)

        const subtotal = menuItem.price * item.quantity
        totalAmount += subtotal
        insertItem.run(params.id, item.item_id, menuItem.name, menuItem.price, item.quantity, subtotal)

        const recipeItems = db.prepare('SELECT * FROM recipe WHERE item_id = ?').all(item.item_id)
        for (const r of recipeItems) {
          const consumeTotal = r.consume_qty * item.quantity
          db.prepare('UPDATE ingredient SET stock_qty = stock_qty - ? WHERE ingredient_id = ?').run(consumeTotal, r.ingredient_id)
        }
      }

      db.prepare('UPDATE "order" SET total_amount = ?, updated_at = datetime(?) WHERE order_id = ?').run(totalAmount, 'now', params.id)
    })

    updateOrder()
    const updated = db.prepare('SELECT * FROM "order" WHERE order_id = ?').get(params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}