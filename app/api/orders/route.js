import { NextResponse } from 'next/server'
import { getDb, generateOrderId } from '@/lib/db'

// GET /api/orders
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const limit = Number(searchParams.get('limit') || 50)
    const offset = Number(searchParams.get('offset') || 0)

    const db = getDb()
    let query = 'SELECT * FROM "order" WHERE 1=1'
    const params = []

    if (status) { query += ' AND status = ?'; params.push(status) }
    if (date) { query += ' AND order_date = ?'; params.push(date) }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const orders = db.prepare(query).all(...params)
    return NextResponse.json({ success: true, data: orders })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/orders
export async function POST(req) {
  try {
    const { customer_name, customer_phone, note, items } = await req.json()
    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'customer_name 和 items 為必填欄位' }, { status: 400 })
    }

    const db = getDb()

    const createOrder = db.transaction(() => {
      const orderId = generateOrderId()
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const menuItem = db.prepare('SELECT * FROM menu_item WHERE item_id = ? AND is_active = 1').get(item.item_id)
        if (!menuItem) throw new Error(`餐點 ID ${item.item_id} 不存在或已下架`)

        const subtotal = menuItem.price * item.quantity
        totalAmount += subtotal

        orderItems.push({
          order_id: orderId,
          item_id: item.item_id,
          item_name: menuItem.name,
          unit_price: menuItem.price,
          quantity: item.quantity,
          subtotal,
        })

        // 扣庫存
        const recipeItems = db.prepare('SELECT * FROM recipe WHERE item_id = ?').all(item.item_id)
        for (const r of recipeItems) {
          const consumeTotal = r.consume_qty * item.quantity
          const ingredient = db.prepare('SELECT * FROM ingredient WHERE ingredient_id = ?').get(r.ingredient_id)
          if (!ingredient || ingredient.stock_qty < consumeTotal) {
            throw new Error(`食材「${ingredient?.name || 'unknown'}」庫存不足（需要 ${consumeTotal}，存量 ${ingredient?.stock_qty || 0}）`)
          }
          db.prepare('UPDATE ingredient SET stock_qty = stock_qty - ? WHERE ingredient_id = ?').run(consumeTotal, r.ingredient_id)
        }
      }

      // 寫入訂單
      db.prepare(`
        INSERT INTO "order" (order_id, customer_name, customer_phone, note, total_amount, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', datetime('now','+8 hours'), datetime('now','+8 hours'))
      `).run(orderId, customer_name, customer_phone || null, note || null, totalAmount)

      // 寫入明細
      const insertItem = db.prepare(`
        INSERT INTO order_item (order_id, item_id, item_name, unit_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      for (const oi of orderItems) {
        insertItem.run(oi.order_id, oi.item_id, oi.item_name, oi.unit_price, oi.quantity, oi.subtotal)
      }

      return orderId
    })

    const orderId = createOrder()
    return NextResponse.json({ success: true, data: { order_id: orderId } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}