# 📄 金濠客食堂 POS 系統 — API 文件

> Base URL: `/api`（開發模式）或 `http://localhost:3000/api`（後端直連）

所有 API 回傳統一格式：
```json
{ "success": true, "data": ... }
{ "success": false, "error": "錯誤訊息" }
```

---

## 🏓 Health Check

### `GET /api/health`
回傳伺服器狀態。

---

## 🍽️ 菜單管理 (Menu)

### `GET /api/menu`
取得所有上架中餐點。可選 `?category=主餐` 過濾。

### `GET /api/menu/categories`
取得所有分類（含各分類品項數）。

### `GET /api/menu/:id`
取得單一品項（含食譜 ingredients）。

### `POST /api/menu`
新增餐點。

```json
{
  "name": "招牌排骨飯",
  "category": "主餐",
  "price": 100,
  "description": "手工醃製排骨搭配三樣配菜",
  "recipe": [{ "ingredient_id": 1, "consume_qty": 0.3 }]
}
```

### `PUT /api/menu/:id`
更新餐點（含食譜，需帶完整 recipe 陣列）。

### `DELETE /api/menu/:id`
軟刪除（下架，is_active = 0）。

---

## 📋 訂單管理 (Orders)

### `GET /api/orders`
訂單列表。參數：`status`, `date`, `limit`, `offset`。

### `GET /api/orders/stats`
儀表板統計：今日營收、近 7 日營收趨勢、熱門品項。

### `GET /api/orders/:id`
單筆訂單 + 明細。

### `POST /api/orders`
建立訂單（transaction 內扣庫存）。

```json
{
  "customer_name": "王小明",
  "customer_phone": "0912345678",
  "note": "不要辣",
  "items": [
    { "item_id": 1, "quantity": 2 },
    { "item_id": 5, "quantity": 1 }
  ]
}
```

### `PUT /api/orders/:id`
修改訂單（僅 pending 狀態可改，transaction 回補再扣）。

### `PATCH /api/orders/:id/status`
更新狀態。可流轉路徑：
```
pending → cooking → delivering → completed
任何狀態 → cancelled（回補庫存）
```

---

## 📦 庫存管理 (Inventory)

### `GET /api/inventory`
食材列表。參數：`?low_stock=true` 只顯示低庫存。

### `GET /api/inventory/:id`
單一食材 + 被哪些餐點使用。

### `PUT /api/inventory/:id`
手動調整庫存。`{ "stock_qty": 15 }`

### `GET /api/inventory/check`
檢查低庫存。

---

## 📥 採購與驗貨 (Purchase Orders)

### `GET /api/purchase-orders`
採購單列表。

### `GET /api/purchase-orders/:id`
採購單 + 明細。

### `POST /api/purchase-orders`
建立採購單。兩種模式：
- 手動：`{ "supplier_id": 1, "items": [...] }`
- 自動補貨：`{ "auto_restock": true }`

### `POST /api/purchase-orders/:id/receive`
驗貨（transaction 入庫）。

```json
{
  "items": [
    { "po_item_id": 1, "received_qty": 10, "is_qualified": 1 },
    { "po_item_id": 2, "received_qty": 8, "is_qualified": 0, "reject_reason": "排骨有異味" }
  ]
}
```

### `GET /api/purchase-orders/:id/returns`
查看退貨清單。

---

## 🤝 供應商管理 (Suppliers)

### `GET /api/suppliers`
所有供應商 + 各供應多少種食材。

### `POST /api/suppliers`
`{ "name": "新供應商", "phone": "05-9999999" }`

### `PUT /api/suppliers/:id`
`{ "name": "更新名稱" }`