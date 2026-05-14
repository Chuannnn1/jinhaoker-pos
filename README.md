# 金濠客食堂 POS 系統

> 前台點餐 + 後台管理，Next.js 14 全端解決方案（SQLite 單一檔案）

[![GitHub Repo](https://img.shields.io/badge/GitHub-Jinhaoker--POS-blue?style=flat-square&logo=github)](https://github.com/Chuannnn1/jinhaoker-pos)

---

## 🏗️ 系統架構

### 一張圖看懂全貌

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App (Port 3100)                   │
│                                                                 │
│   ┌─────────────┐            ┌────────────────────────────────┐ │
│   │   Frontend  │            │          API Layer             │ │
│   │  (React)    │            │   (Next.js API Routes)         │ │
│   ├─────────────┤            │                                │ │
│   │  前台 `/`   │───fetch───▶│  app/api/menu/route.ts         │ │
│   │  後台       │◀──JSON────│  app/api/orders/route.ts        │ │
│   │  `/admin/*` │            │  app/api/inventory/route.ts    │ │
│   └─────────────┘            │  app/api/purchase-orders/...   │ │
│                              └──────────────┬───────────────────┘ │
│                                             │                    │
│                                             ▼                    │
│                               ┌─────────────────────────────┐   │
│                               │   Data Layer (TypeScript)    │   │
│                               │   lib/db.ts → better-sqlite3 │   │
│                               └──────────────┬───────────────┘   │
│                                             │                    │
│                                             ▼                    │
│                               ┌─────────────────────────────┐   │
│                               │      SQLite 3 單一檔案      │   │
│                               │       data/jinhaoker.db      │   │
│                               └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 架構說明（新手必看）

| 層 | 技術 | 職責 |
|----|------|------|
| **Frontend** | Next.js App Router（React） | 前台點餐、後台 UI |
| **API** | Next.js API Routes（TypeScript） | 所有 CRUD 端點，在 `app/api/` |
| **Data Access** | better-sqlite3 | 直接 call SQLite，不需要 ORM |
| **Database** | SQLite 3（單一 .db 檔案） | 8 張表，含 FK、index、transaction |

**關鍵認知**：Next.js 同時是前端框架也是後端框架，不需要另外架 Express 伺服器。API 就寫在 `app/api/` 目錄裡，啟動一個 `npm run dev` 全部搞定。

### 目錄結構

```
jinhaoker-pos/
├── app/
│   ├── api/                    ← API 層（後端）
│   │   ├── menu/route.ts            GET/POST/PUT/DELETE
│   │   ├── orders/route.ts          GET/POST/PUT
│   │   ├── orders/[id]/status/      PATCH（更新狀態）
│   │   ├── inventory/               GET/PUT
│   │   ├── purchase-orders/        GET/POST
│   │   ├── purchase-orders/[id]/receive/  POST（驗貨）
│   │   └── suppliers/               GET/POST/PUT
│   ├── admin/                  ← 後台頁面
│   │   ├── layout.tsx               (Sidebar 佈局)
│   │   ├── dashboard/page.tsx       (儀表板)
│   │   ├── menu/page.tsx           (菜單管理)
│   │   ├── orders/page.tsx         (訂單管理)
│   │   └── inventory/page.tsx      (庫存管理)
│   ├── page.tsx                 ← 前台點餐頁（顧客）
│   ├── layout.tsx               ← Root layout
│   └── globals.css
├── lib/
│   ├── db.ts                    ← SQLite 初始化（better-sqlite3）
│   ├── schema.sql               ← 8 張表 DDL
│   ├── seed.sql                 ← 測試資料
│   └── types.ts                 ← TypeScript 型別
├── docs/
│   ├── API-GUIDE.md             ← API 撰寫範例（必看）
│   ├── API.md                   ← API 端點摘要
│   └── ADR.md                   ← 技術選型理由
├── data/
│   └── jinhaoker.db             ← SQLite 資料庫（.gitignore）
├── public/
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 📊 資料庫 Schema（8 張表）

```
supplier ──1:N──▶ ingredient ──M:N──▶ menu_item ◀──M:N── order
                     │                │                │
                     │                │                1:N
                     │                │                │
                     └──▶ purchase_order ──▶ purchase_order_item
```

| Table | 用途 | Key Fields |
|-------|------|-----------|
| `supplier` | 供應商 | id, name, phone, address |
| `ingredient` | 食材 / 庫存 | id, name, unit, stock_qty, safety_stock |
| `menu_item` | 菜單品項 | id, name, category, price, is_active |
| `recipe` | 食譜（M:N 中間表） | menu_item_id, ingredient_id, consume_qty |
| `order` | 訂單 | order_id, customer_name, status, total_amount |
| `order_item` | 訂單明細 | order_id, item_id, quantity, price |
| `purchase_order` | 採購單 | id, supplier_id, status, total_amount |
| `purchase_order_item` | 採購明細 | po_id, ingredient_id, ordered_qty, received_qty |

**Transaction 規範**：建立訂單、驗貨入庫、取消訂單（回補庫存）均包在同一個 DB transaction 內，任何一步失敗自動 rollback。

---

## ⚡ 快速開始

```bash
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos
npm install
npm run db:init        # 建立資料表 + 寫入測試資料
npm run dev            # 啟動 → http://localhost:3100
```

**確認成功：**
```bash
curl http://localhost:3100/api/health
# → {"success":true,"data":{"status":"running"}}
```

**系統入口：**
- 前台點餐 → `http://localhost:3100`
- 後台管理 → `http://localhost:3100/admin/dashboard`

---

## 🔌 API 端點摘要

所有 API 回傳格式：`{ success: true, data: ... }` 或 `{ success: false, error: "..." }`

### Health
```
GET  /api/health              健康檢查
```

### Menu（菜單）
```
GET  /api/menu                 取得所有上架餐點（可 ?category=主餐 過濾）
GET  /api/menu/categories      所有分類
GET  /api/menu/:id             單一餐點（含食譜）
POST /api/menu                 新增餐點
PUT  /api/menu/:id             更新餐點（含食譜）
DEL  /api/menu/:id             下架（軟刪除）
```

### Orders（訂單）
```
GET  /api/orders               訂單列表（可 ?status=pending 過濾）
GET  /api/orders/stats         儀表板統計（今日營收、近7日趨勢）
GET  /api/orders/:id           單筆訂單含明細
POST /api/orders               建立訂單（自動扣庫存，transaction）
PUT  /api/orders/:id           修改訂單（僅 pending 可改）
PATCH /api/orders/:id/status   更新狀態：pending→cooking→delivering→completed
```

### Inventory（庫存）
```
GET  /api/inventory            食材列表（可 ?low_stock=true 僅看低庫存）
GET  /api/inventory/:id        單一食材 + 被哪些餐點使用
PUT  /api/inventory/:id        手動調整庫存
```

### Purchase Orders（採購）
```
GET  /api/purchase-orders                    採購單列表
GET  /api/purchase-orders/:id                採購單含明細
POST /api/purchase-orders                    新建採購單 / 自動補貨
POST /api/purchase-orders/:id/receive        驗貨入庫（transaction）
```

### Suppliers（供應商）
```
GET  /api/suppliers            所有供應商
POST /api/suppliers            新增供應商
PUT  /api/suppliers/:id        更新供應商
```

詳細範例程式碼 → [docs/API-GUIDE.md](docs/API-GUIDE.md)

---

## 👥 分工表

| 模組 | 負責人 | 狀態 |
|------|--------|------|
| 前台點餐 | Chuannnn | ✅ 已實作 |
| 後台 UI | Chuannnn | 🔨 施工中 |
| Menu API | Chuannnn | ✅ 已實作 |
| Orders API | 待分配 | ⏳ 待開發 |
| Inventory API | 待分配 | ⏳ 待開發 |
| Purchase Orders API | 待分配 | ⏳ 待開發 |
| Dashboard Stats API | 待分配 | ⏳ 待開發 |

---

## 📋 本週目標（對照 Spec）

> 每週開始前對照這份清單，確認完成項目

| # | 任務 | 驗收標準 | 狀態 |
|---|------|---------|------|
| 1 | Schema 建立 | `npm run db:init` 成功，8 張表都能查到資料 | ✅ |
| 2 | Menu API | GET/POST/PUT/DELETE 全通，帶 Transaction | ✅ |
| 3 | 前台 UI | 分類切換、購物車、送出訂單 | ✅ |
| 4 | Orders API | 訂單建立含扣庫存、狀態流轉 | ⏳ |
| 5 | 後台 UI | Dashboard / 訂單管理 / 庫存管理 | ⏳ |

---

## 🌿 Git 開發流程

```bash
# 1. 從 main 開分支
git checkout main && git pull
git checkout -b feature/模組名

# 2. 寫 code...

# 3. Commit（注意格式）
git add .
git commit -m "feat: 完成 XXX"     # feat/fix/docs/refactor/chore

# 4. Push 並開 PR
git push -u origin feature/模組名
# → 然後到 GitHub 開 Pull Request
```

---

## 📚 文件索引

| 文件 | 用途 |
|------|------|
| [docs/API-GUIDE.md](docs/API-GUIDE.md) | API 撰寫規範 + 6 個完整範例（**必看**） |
| [docs/API.md](docs/API.md) | API 端點完整列表 |
| [docs/ADR.md](docs/ADR.md) | 技術選型理由（為何用 Next.js、SQLite、better-sqlite3） |

---

## ✅ 啟動前檢查清單

- [ ] `npm install` 完成
- [ ] `npm run db:init` 完成
- [ ] `http://localhost:3100` 前台正常
- [ ] `http://localhost:3100/admin/dashboard` 後台正常
- [ ] 看過 [docs/API-GUIDE.md](docs/API-GUIDE.md)