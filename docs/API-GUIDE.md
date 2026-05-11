# 📐 API 開發指南 — 給組員的撰寫規範

> 所有 API Route 都放在 `app/api/` 底下
> 所有回傳格式必須統一，否則前端會爆炸

---

## 黃金原則（必遵守）

```javascript
// ✅ 成功一定要這樣回
{ "success": true, "data": ... }

// ❌ 失敗一定要這樣回
{ "success": false, "error": "清楚說明錯誤原因" }

// ❌ 絕對不要這樣做
{ "data": ... }                     // 少了 success
{ "success": true, "message": "ok" } // 用 message 取代 data
res.send("ok")                       // 不是 JSON
```

---

## 範例 1：最簡單的 GET API

**檔案位置：** `app/api/health/route.js`

```javascript
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: { status: 'running' }
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
```

---

## 範例 2：GET 帶參數（查詢 + 路徑）

**檔案位置：** `app/api/menu/route.js`

```javascript
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/menu?category=主餐
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')  // ← 從網址拿參數

    const db = getDb()
    let items

    if (category) {
      items = db.prepare(
        'SELECT * FROM menu_item WHERE is_active = 1 AND category = ? ORDER BY sort_order'
      ).all(category)
    } else {
      items = db.prepare(
        'SELECT * FROM menu_item WHERE is_active = 1 ORDER BY category, sort_order'
      ).all()
    }

    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
```

### GET 帶路徑參數（動態路由）

**檔案位置：** `app/api/menu/[id]/route.js`

```javascript
// GET /api/menu/5 ← 拿第 5 道菜
export async function GET(req, { params }) {
  try {
    const id = Number(params.id)  // ← 從網址路徑拿 id
    const db = getDb()

    const item = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(id)
    if (!item) {
      // ❌ 找不到 → 回 404
      return NextResponse.json(
        { success: false, error: '餐點不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: item })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
```

---

## 範例 3：POST — 建立新資料

**檔案位置：** `app/api/menu/route.js`

```javascript
// POST /api/menu
export async function POST(req) {
  try {
    const body = await req.json()  // ← 一定要 await！
    const { name, category, price, description } = body

    // ✅ 檢查必填欄位
    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'name、category、price 為必填欄位' },
        { status: 400 }
      )
    }

    const db = getDb()
    const result = db.prepare(
      'INSERT INTO menu_item (name, category, price, description) VALUES (?, ?, ?, ?)'
    ).run(name, category, price, description || null)

    // ✅ 201 = 建立成功
    return NextResponse.json(
      { success: true, data: { item_id: Number(result.lastInsertRowid) } },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
```

---

## 範例 4：PATCH — 更新狀態

**檔案位置：** `app/api/orders/[id]/status/route.js`

```javascript
// PATCH /api/orders/202605100003/status
export async function PATCH(req, { params }) {
  try {
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'status 為必填' },
        { status: 400 }
      )
    }

    const db = getDb()
    const order = db.prepare('SELECT * FROM "order" WHERE order_id = ?').get(params.id)

    if (!order) {
      return NextResponse.json(
        { success: false, error: '訂單不存在' },
        { status: 404 }
      )
    }

    // 更新資料庫
    db.prepare(`UPDATE "order" SET status = ?, updated_at = datetime('now','+8 hours') WHERE order_id = ?`)
      .run(status, params.id)

    const updated = db.prepare('SELECT * FROM "order" WHERE order_id = ?').get(params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
```

---

## 範例 5：DELETE — 軟刪除

```javascript
// DELETE /api/menu/1（下架，不是真的刪）
export async function DELETE(req, { params }) {
  try {
    const id = Number(params.id)
    const db = getDb()

    const existing = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '餐點不存在' },
        { status: 404 }
      )
    }

    db.prepare(
      "UPDATE menu_item SET is_active = 0, updated_at = datetime('now','+8 hours') WHERE item_id = ?"
    ).run(id)

    return NextResponse.json({ success: true, data: { message: '已下架' } })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
```

---

## 範例 6：Transaction — 同時寫多張表（最常犯錯的地方）

```javascript
// 建立訂單 + 扣庫存，必須在同一個 transaction 內
const createOrder = db.transaction(() => {
  // 1. 產生訂單編號
  const orderId = generateOrderId()

  // 2. 寫入訂單
  db.prepare(`INSERT INTO "order" (...) VALUES (...)`).run(...)

  // 3. 寫入明細
  db.prepare(`INSERT INTO order_item (...) VALUES (...)`).run(...)

  // 4. 扣庫存
  for (const r of recipeItems) {
    db.prepare('UPDATE ingredient SET stock_qty = stock_qty - ? WHERE ingredient_id = ?')
      .run(consumeTotal, r.ingredient_id)
  }

  return orderId
})

const orderId = createOrder()  // ← 執行 transaction
// 如果以上任何一步失敗，全部 rollback，資料不會髒掉
```

---

## 📋 快速檢查表（寫完 API 後必過）

- [ ] 回傳格式是 `{ success: true, data: ... }`？
- [ ] 失敗時格式是 `{ success: false, error: "..." }`？
- [ ] 成功建立資源用 `status(201)`？
- [ ] 找不到資源用 `status(404)`？
- [ ] 參數錯誤用 `status(400)`？
- [ ] 有包 `try-catch`？
- [ ] 如果跨多張表寫入，有包 `db.transaction()`？

---

## 🧪 測試自己的 API

```bash
# GET
curl http://localhost:3100/api/orders

# POST
curl -X POST http://localhost:3100/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"test","items":[{"item_id":1,"quantity":1}]}'

# PATCH
curl -X PATCH http://localhost:3100/api/orders/202605100001/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```