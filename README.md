# 🍱 金濠客食堂 POS 系統

> 嘉義最強食堂的 POS 系統 — 前台點餐 + 後台管理

## 🎯 專案目標

一套輕量、好上手、團隊友善的 POS 系統，支援：
- **前台點餐**（顧客自行點餐）
- **後台管理**（營運儀表板、訂單、菜單、庫存管理）

---

## 🚀 快速開始（10 秒）

```bash
git clone <repo-url>
cd jinhaoker-pos
bash scripts/setup.sh
```

系統會在兩個 Port 啟動：
| | URL | 說明 |
|---|---|---|
| **後端 API** | `http://localhost:3000` | Express + SQLite |
| **前端開發** | `http://localhost:5173` | React + Vite + Tailwind |

> ⚡ Production 模式：`npm run build && npm start`，前後端都從 Port 3000 提供。

---

## 🏗️ 專案結構

```
jinhaoker-pos/
├── backend/              ← Express API 後端
│   ├── src/
│   │   ├── db/           ← SQL schema + seed + connection
│   │   ├── routes/       ← API 路由
│   │   ├── services/     ← 商業邏輯
│   │   └── middleware/   ← 錯誤處理
│   ├── package.json
│   └── start.sh
├── frontend/             ← React + Vite 前端
│   ├── src/
│   │   ├── pages/        ← 頁面元件
│   │   ├── components/   ← 共用元件
│   │   └── api/          ← API 客戶端
│   └── package.json
├── docs/                 ← 文件
│   ├── SPEC.md           ← 功能規格
│   ├── API.md            ← API Endpoint 文件
│   └── ADR.md            ← 技術選型理由
├── scripts/
│   └── setup.sh          ← 一鍵安裝腳本
├── data/                 ← SQLite DB 檔案
├── README.md
└── CONTRIBUTING.md
```

---

## 📦 技術棧

| 層面 | 選擇 | 為什麼 |
|------|------|--------|
| 後端 | Express (Node.js) | 零配置、JS 組員友善 |
| 資料庫 | SQLite (better-sqlite3) | 零安裝、單一檔案 |
| 前端 | React 18 + Vite | HMR 快、React 生態最大 |
| 樣式 | Tailwind CSS | Utility-first 開發快 |
| 圖表 | Recharts | React-native API |
| 圖示 | Lucide React | Tree-shakable、風格統一 |

> 完整選型理由 → [docs/ADR.md](docs/ADR.md)

---

## 🧑‍💻 團隊分工

| 模組 | 負責人 | 狀態 | API | 前台頁面 |
|------|--------|------|-----|---------|
| **Menu** | Chuannnn | ✅ 已完成規格與骨架 | `GET/POST/PUT/DELETE /api/menu` | `/admin/menu` + 前台點餐 |
| **Orders** | ⏳ 待分配 | 骨架完成 | `GET/POST/PUT/PATCH /api/orders` | `/admin/orders` |
| **Inventory** | ⏳ 待分配 | 骨架完成 | `GET/PUT /api/inventory` | `/admin/inventory` |
| **Purchasing** | ⏳ 待分配 | 骨架完成 | `GET/POST /api/purchase-orders` | TBD |
| **Suppliers** | ⏳ 待分配 | 骨架完成 | `GET/POST/PUT /api/suppliers` | TBD |

> 每個模組都包含完整的 route + service + test 骨架。規格與 API 文件在 `docs/`。

---

## 🌿 開發流程

1. **看 spec**：先讀 `docs/SPEC.md` 了解該模組的規格
2. **開分支**：`git checkout -b feature/your-module`
3. **寫 code**：實作 route + service
4. **發 PR**：開 Pull Request，等 review
5. **Merge**：code review 通過後 merge 到 main

> Branch 與 PR 規範 → [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📚 文件索引

| 文件 | 說明 |
|------|------|
| [docs/SPEC.md](docs/SPEC.md) | 完整功能規格 |
| [docs/API.md](docs/API.md) | API Endpoint 文件 |
| [docs/ADR.md](docs/ADR.md) | 技術選型決策記錄 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 協作規範 |

---

## ✅ Onboarding Checklist

- [ ] `bash scripts/setup.sh` 執行成功
- [ ] 後端 `http://localhost:3000/api/health` 回傳 `{ "success": true }`
- [ ] 前端開發模式 `http://localhost:5173` 看得到點餐頁面
- [ ] 後台 `http://localhost:5173/admin/dashboard` 有資料
- [ ] 讀過 [docs/SPEC.md](docs/SPEC.md) 了解你的模組
- [ ] 讀過 [CONTRIBUTING.md](CONTRIBUTING.md) 了解協作規範

---

## 🌟 API 測試範例

```bash
# Health
curl http://localhost:3000/api/health

# 取得菜單
curl http://localhost:3000/api/menu

# 建立訂單
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"王小明","items":[{"item_id":1,"quantity":2}]}'

# 查看訂單
curl http://localhost:3000/api/orders

# 更新狀態
curl -X PATCH http://localhost:3000/api/orders/202605100003/status \
  -H "Content-Type: application/json" \
  -d '{"status":"cooking"}'
```