# 金濠客食堂 POS 系統 — Next.js 版本

> 前台點餐 + 後台管理，Next.js 14 App Router 全端解決方案

[![GitHub Repo](https://img.shields.io/badge/GitHub-公開 Repo-blue?style=flat-square&logo=github)](https://github.com/Chuannnn1/jinhaoker-pos)

> 📖 **組員必看** → [ONBOARDING.md](ONBOARDING.md) — 環境安裝、分工、Git 流程 5 分鐘搞懂

---

## 🎯 專案目標

一套輕量、快、好實作的 POS 系統：
- **前台點餐**（顧客自行點餐）
- **後台管理**（營運儀表板、訂單、菜單、庫存）

---

## 🚀 快速開始（5 分鐘）

```bash
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos
npm install
npm run db:init
npm run dev
```

**伺服器啟動後：**
- 前台：`http://localhost:3100`
- 後台：`http://localhost:3100/admin/dashboard`
- API: `http://localhost:3100/api/health`

---

## 🏗️ 專案結構（Next.js 14 App Router）

```
jinhaoker-pos/
├── app/                    ← Next.js pages + API（App Router）
│   ├── api/               ← API Routes（替換 Express routes）
│   │   ├── menu/route.js      (GET/POST /api/menu)
│   │   ├── orders/route.js    (GET/POST /api/orders)
│   │   ├── inventory/route.js
│   │   ├── purchase-orders/route.js
│   │   └── suppliers/route.js
│   ├── admin/             ← 後台頁面
│   │   ├── layout.jsx       (Sidebar 佈局)
│   │   └── dashboard/page.jsx
│   ├── layout.jsx           (Root layout)
│   └── page.jsx             (前台點餐頁)
├── lib/                   ← 核心功能
│   ├── db.js              (SQLite 連線)
│   ├── schema.sql         (資料表結構)
│   └── seed.sql           (測試資料)
├── components/
│   └── layout/
│       └── AdminLayout.jsx
├── public/               ← 靜態資源
└── docs/                 ← 文件
```

---

## 📦 Next.js 架構優勢（vs 之前 Express 版）

| 特性 | Express 版（舊） | Next.js 版（新） |
|------|----------------|-----------------|
| **Port** | 前端 5173 + 後端 3000 | **單一 Port 3100** |
| **部署** | 兩個程序，需要 Nginx 整合 | **一個命令 `next start`** |
| **路由** | Express Router + React Router | **Next.js App Router（檔案即路由）** |
| **SSR** | ❌ 純 SPA | ✅ 可 SSR/SSG/ISR |
| **額外配置** | 需要 proxy 跨域 | ✅ 內建 API Proxy |

---

## 🧑‍💻 分工表

| 模組 | 負責人 | API 文件 |
|------|--------|---------|
| **前台點餐** | Chuannnn + Atlas | — |
| **後台管理** | Chuannnn + Atlas | — |
| **Menu API** | **Chuannnn** | [`docs/API.md`](docs/API.md) |
| **Orders API** | ⏳ 開放認領 | [`docs/API.md`](docs/API.md) |
| **Inventory API** | ⏳ 開放認領 | [`docs/API.md`](docs/API.md) |
| **Purchasing API** | ⏳ 開放認領 | [`docs/API.md`](docs/API.md) |

---

## 🌿 Git 開發流程

**先看影片** → [Git Branch 教學](https://youtu.be/P-nbNgIzlYE)

```bash
# 1. 開分支（從 main）
git checkout -b feature/orders-api

# 2. 寫 code...

# 3. Commit
git add .
git commit -m "feat: 完成訂單 API"

# 4. Push
git push -u origin feature/orders

# 5. GitHub 上開 Pull Request
```

---

## 📚 文件索引

| 文件 | 說明 |
|------|------|
| [ONBOARDING.md](ONBOARDING.md) | 組員入門摘要（必看） |
| [docs/SPEC.md](docs/SPEC.md) | 功能規格 |
| [docs/API.md](docs/API.md) | API 端點文件 |
| [docs/ADR.md](docs/ADR.md) | 技術選型理由（Andre 001: Next.js） |

---

## ✅ Before You Start

- [ ] `npm install` 完成
- [ ] `npm run db:init` 完成
- [ ] `http://localhost:3100` 看得點餐頁
- [ ] `http://localhost:3100/admin/dashboard` 看得儀表板
- [ ] 看過 [ONBOARDING.md](ONBOARDING.md)
- [ ] 看過 [Git 影片](https://youtu.be/P-nbNgIzlYE)

---

## API 測試範例

```bash
# Health
curl http://localhost:3100/api/health

# 取得菜單
curl http://localhost:3100/api/menu

# 建立訂單
curl -X POST http://localhost:3100/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"測試","items":[{"item_id":1,"quantity":1}]}'

# 訂單狀態更新
curl -X PATCH http://localhost:3100/api/orders/202605100003/status \
  -H "Content-Type: application/json" \
  -d '{"status":"cooking"}'
```

---

## 📞 問題？

- **技術問題** → GitHub 開 Issue
- **功能需求** → 先看 [SPEC.md](docs/SPEC.md)
- **PR 被拒** → 看 [ONBOARDING.md](ONBOARDING.md)