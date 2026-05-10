# 🍱 金濠客食堂 POS 系統

> 嘉義最強食堂的 POS 系統 — 前台點餐 + 後台管理

[![GitHub Repo](https://img.shields.io/badge/GitHub-公開 Repo-blue?style=flat-square&logo=github)](https://github.com/Chuannnn1/jinhaoker-pos)

> 📖 **組員必看** → [ONBOARDING.md](ONBOARDING.md) — 環境安裝、分工、Git 流程 5 分鐘搞懂

---

## 🎯 專案目標

一套輕量、好上手、團隊友善的 POS 系統：
- **前台點餐**（顧客自行點餐）
- **後台管理**（營運儀表板、訂單、菜單、庫存管理）

---

## 🚀 快速開始（10 秒）

```bash
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos
bash scripts/setup.sh
```

**需要兩個終端機：**
```bash
# Terminal 1 — 後端 API（Port 3000）
cd backend && npm run dev

# Terminal 2 — 前端（Port 5173）
cd frontend && npm run dev
```

> ⚡ Production 模式：`cd frontend && npm run build`，然後 `cd backend && npm start`，全部從 Port 3000 提供。

---

## 🏗️ 專案結構

```
jinhaoker-pos/
├── backend/              ← Express + SQLite 後端
│   ├── src/
│   │   ├── db/           ← SQL schema + seed + connection
│   │   ├── routes/        ← API 路由
│   │   ├── services/      ← 商業邏輯
│   │   └── middleware/   ← 錯誤處理
├── frontend/             ← React + Vite + Tailwind 前端
│   ├── src/
│   │   ├── pages/        ← 頁面元件
│   │   ├── components/   ← 共用元件
│   │   └── api/          ← API 客戶端
├── docs/                 ← 文件
│   ├── SPEC.md           ← 功能規格
│   ├── API.md            ← API Endpoint 文件
│   └── ADR.md            ← 技術選型理由（為什麼這樣選）
├── scripts/
│   └── setup.sh          ← 一鍵安裝腳本
└── .github/
    └── PULL_REQUEST_TEMPLATE.md
```

---

## 📦 技術棧（為什麼這樣選？）

| 層面 | 選擇 | 為什麼 |
|------|------|--------|
| 後端 | Express (Node.js) | 零配置、組員最熟悉 JS |
| 資料庫 | SQLite (better-sqlite3) | 零安裝、單一檔案、不需 Docker |
| 前端 | React 18 + Vite | HMR 快、React 生態最大 |
| 樣式 | Tailwind CSS | Utility-first 開發快 |
| 圖表 | Recharts | React-native API |
| 圖示 | Lucide React | Tree-shakable、風格統一 |

> 詳細選型理由 → [docs/ADR.md](docs/ADR.md)

---

## 🧑‍💻 團隊分工

> ⚠️ **重要**：開始做任何功能前，請先看 [docs/SPEC.md](docs/SPEC.md) 和 [CONTRIBUTING.md](CONTRIBUTING.md)！

| 模組 | 負責人 | 說明 | API 文件 | 前台頁面 |
|------|--------|------|---------|----------|
| **前台點餐** | Chuannnn + Atlas | 顧客點餐流程 | — | `/` |
| **後台管理** | Chuannnn + Atlas | 管理面板 UI | — | `/admin/*` |
| **Menu CRUD** | **Chuannnn** | 菜單增刪改查、分類 | `GET/POST/PUT/DELETE /api/menu` | `/admin/menu` + 前台 |
| **Orders** | ⏳ 待分配 | 訂單建立、狀態流轉、庫存扣補 | `GET/POST/PUT/PATCH /api/orders` | `/admin/orders` |
| **Inventory** | ⏳ 待分配 | 食材管理、低庫存警示 | `GET/PUT /api/inventory` | `/admin/inventory` |
| **Purchasing** | ⏳ 待分配 | 採購單、驗貨入庫、退貨 | `GET/POST /api/purchase-orders` | TBD |
| **Suppliers** | ⏳ 待分配 | 供應商管理 | `GET/POST/PUT /api/suppliers` | TBD |

### 🔥 Menu 模組特別說明（Chuannnn 負責）
> 這個模組的 CRUD API 和 UI 交給 Chuannnn 負責，架構和 schema 已由 Atlas 幫你鋪好。
> 詳細規格 → [docs/SPEC.md](docs/SPEC.md)

---

## 🌿 Git 開發流程

請先看完這支影片再開始開發：
**📺 [Git Branch 教學影片](https://youtu.be/P-nbNgIzlYE)**

### 標準流程

```bash
# 1. 從 main 開新分支
git checkout -b feature/menu-crud

# 2. 實作完成後 commit
git add .
git commit -m "feat: 完成 Menu CRUD API"

# 3. 推到 GitHub
git push -u origin feature/menu-crud

# 4. 到 GitHub 開 Pull Request
# → https://github.com/Chuannnn1/jinhaoker-pos

# 5. 等 Code Review 通過後合併到 main
```

### Branch 命名規範
```bash
feature/menu-crud          ← 新功能
feature/order-status-flow  ← 新功能
fix/inventory-bug          ← Bug 修復
docs/api-update            ← 文件更新
```

> 完整規範 → [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📚 文件索引

| 文件 | 說明 |
|------|------|
| [docs/SPEC.md](docs/SPEC.md) | 完整功能規格（先讀這個） |
| [docs/API.md](docs/API.md) | API Endpoint 文件 |
| [docs/ADR.md](docs/ADR.md) | 技術選型決策記錄（為什麼這樣選） |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Git 規範、PR 流程 |

---

## ✅ Onboarding Checklist

- [ ] `bash scripts/setup.sh` 執行成功
- [ ] `npm run dev` 後端啟動正常 → `http://localhost:3000/api/health` 回傳 `{ "success": true }`
- [ ] 前端 `http://localhost:5173` 看得到點餐頁面
- [ ] 後台 `http://localhost:5173/admin/dashboard` 有資料
- [ ] 看過 [docs/SPEC.md](docs/SPEC.md)
- [ ] 看過 [CONTRIBUTING.md](CONTRIBUTING.md)
- [ ] 看過 [📺 Git Branch 教學影片](https://youtu.be/P-nbNgIzlYE)

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

# 更新狀態（pending → cooking）
curl -X PATCH http://localhost:3000/api/orders/202605100003/status \
  -H "Content-Type: application/json" \
  -d '{"status":"cooking"}'
```

---

## 📞 問題？

- **技術問題** → 開 Issue 或直接問
- **功能需求** → 先看 [docs/SPEC.md](docs/SPEC.md) 確認規格
- **PR 被拒** → 看 [CONTRIBUTING.md](CONTRIBUTING.md) 確認規範