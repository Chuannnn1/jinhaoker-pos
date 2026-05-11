# 📋 金濠客食堂 POS 系統 — 功能規格

> 此文件整合 backend spec（Express + SQLite）與 frontend spec（React + Tailwind），
> 作為團隊開發的統一參考文件。

---

## 1. 系統概覽

```
┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  前台點餐    │────▶│  Express API │────▶│ SQLite   │
│  (顧客瀏覽器)│     │  Port 3000  │     │ 單一檔案 │
└─────────────┘     └─────────────┘     └──────────┘
┌─────────────┐           │
│  後台管理    │───────────┘
│  (管理者)   │
└─────────────┘
```

---

## 2. 模組與分工

| 模組 | 負責人 | 說明 | API 端點 | 前端頁面 |
|------|--------|------|---------|----------|
| **Menu** | Chuannnn | 菜單 CRUD、分類管理 | `/api/menu` | `/admin/menu`, `前台點餐` |
| **Orders** | TBD | 訂單建立、狀態流轉、庫存扣補 | `/api/orders` | `/admin/orders` |
| **Inventory** | TBD | 食材管理、庫存盤點、低庫存警示 | `/api/inventory` | `/admin/inventory` |
| **Purchasing** | TBD | 採購單、驗貨入庫、退貨管理 | `/api/purchase-orders` | TBD |
| **Suppliers** | TBD | 供應商管理 | `/api/suppliers` | TBD |
| **Dashboard** | TBD | 營收統計、趨勢圖表、熱門排行 | `/api/orders/stats` | `/admin/dashboard` |

---

## 3. 資料庫 Schema（已實作）

7 張表 + 多個 Index：
- `supplier` — 供應商
- `ingredient` — 食材（含庫存量、安全庫存）
- `menu_item` — 菜單品項（含 sort_order, image_url）
- `recipe` — 食譜（餐點 ↔ 食材 消耗關係）
- `order` — 訂單（狀態流：pending → cooking → delivering → completed）
- `order_item` — 訂單明細
- `purchase_order` / `purchase_order_item` — 採購與驗貨

---

## 4. 核心商業邏輯

### 訂單建立（Transaction 內完成）
1. 檢查所有 item 是否上架
2. 檢查庫存（逐項檢查 recipe 消耗量）
3. 產生 order_id（YYYYMMDD + 4 碼流水號）
4. 寫入 order + order_items
5. 扣除食材庫存
6. 任一環節失敗 → 自動 rollback

### 訂單取消
- 回補所有已扣庫存（同樣 transaction）
- 只有 pending 狀態可以修改

### 驗貨入庫
- 合格品項 → 入庫增加 stock_qty
- 不合格品項 → 記錄 reject_reason
- 自動計算採購單總金額

---

## 5. 前台點餐流程（Customer）

1. 顧客輸入稱呼
2. 選擇分類 → 瀏覽餐點
3. 點擊餐品加入購物車（可調整數量）
4. 輸入備註
5. 送出訂單 → 顯示完成確認 + 訂單編號

---

## 6. 後台管理（Admin）

- **儀表板**：今日營收、訂單數、近 7 日趨勢圖、熱門排行
- **訂單管理**：篩選狀態、搜尋、更新狀態（pending → cooking → delivering → completed）
- **菜單管理**：CRUD、分類、上下架
- **庫存管理**：列表、低庫存警示

---

## 7. 外送員通知（⏳ 暫不開發，spec 先收）

### 功能描述
當訂單狀態更新為「外送中 (delivering)」時，系統自動通知外送員。

### 實作方案（暫定）
- **工具**：n8n (workflow automation)
- **觸發點**：`PATCH /api/orders/:id/status → delivering`
- **通知方式**：待確定（LINE Notify / Telegram Bot / WebSocket）
- **被通知者**：外送員（需先定義外送員名單或群組）

### 整合流程（草稿）
```
訂單狀態 → delivering
    ↓
Next.js 發出 webhook → n8n 接收
    ↓
n8n 判斷通知對象 → 發送通知
    ↓
外送員收到通知 → 接單外送
```

### 待釐清事項
- [ ] 外送員用什麼方式接收通知？（LINE / Telegram / SMS）
- [ ] 通知內容要包含什麼？（訂單摘要、地址、金額）
- [ ] n8n 要自架還是用 cloud？
- [ ] 外送員名單從哪裡來？（DB？設定檔？）

### 狀態
⏳ **本功能已納入 spec，但暫不開發。** 等決定要做再開工。

---

## 8. 部署方案

### 方案 A：Tailscale 內網（推薦）
```bash
# 在任何有 Tailscale 的機器上跑
nohup npm run dev > pos.log 2>&1 &
# 透過 Tailscale IP 連線
```

### 方案 B：別台主機
```bash
# 需設開機自啟 + 防火牆 port 3100
npm install -g pm2
pm2 start npm --name "pos" -- dev
pm2 save
```

### 方案 C：本機開發
最簡單，關機就沒了。

---

## 9. 資料流保證（Pre-Ship Checklist）

- [x] 所有跨表寫入包在 transaction 內
- [x] API 回傳統一 `{ success, data/error }` 格式
- [x] 所有 route handler 有 try-catch
- [x] Mock/stub 在 production 不執行（無 mock）
- [x] Error 有明確訊息（庫存不足時指明哪個食材）