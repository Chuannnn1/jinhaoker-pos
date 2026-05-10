# 🏗️ Architecture Decision Record (ADR)

## ADR-001: 為什麼選這個技術棧？

### Context
金濠客食堂 POS 系統需要一個輕量、易部署、團隊初學者友善的全端方案。目標是讓組員能在 10 分鐘內從零開始跑起來，並能分工開發不同模組。

### Decision

| 層面 | 選擇 | 替代方案 | 理由 |
|------|------|----------|------|
| 後端框架 | **Express (Node.js)** | Django, Flask, Spring Boot | 組員最熟悉 JS，Express 零配置，一行 `npm start` 就起來 |
| 資料庫 | **SQLite (better-sqlite3)** | PostgreSQL, MySQL | 零安裝、單一檔案、不需要 Docker。對 POS 規模（單店）完全夠用 |
| 前端框架 | **React + Vite** | Next.js, Vue, Svelte | React 最大生態、組員普遍會。Vite 比 CRA 快 10x |
| 樣式 | **Tailwind CSS** | Bootstrap, styled-components | Utility-first 開發快，初學者不用寫大量 CSS |
| 圖表 | **Recharts** | Chart.js, D3 | React-native API，宣告式寫法，學習曲線最低 |

### Trade-offs

- **SQLite vs PostgreSQL**：SQLite 不支援 concurrent write，但單店 POS 同一時間只有一台收銀，完全沒問題。換 PostgreSQL 是「等真的需要時再換」而不是「先裝起來放」。
- **Express vs Next.js**：Express API 更透明，組員可以清楚看到 route → service → DB 的資料流，教學效果好。
- **Vite vs CRA**：CRA 已 deprecated，Vite 是現在 React 生態的標準啟動方式。

### Consequences
- 優點：零 DevOps 負擔，clone 下來 `npm install && npm run dev` 就能開發
- 代價：未來 scale 到多店時需要換 DB 和加入 auth

---

## ADR-002: 為什麼設計成 Monorepo 而非分開 Repo？

### Context
團隊需要多人協作，但同時需要一個統一的開發環境。

### Decision
使用 monorepo 結構，backend 和 frontend 在同一 repo 但各自獨立目錄。

### Trade-offs
- **優點**：
  - 一份 README 搞定所有安裝
  - API 和前端版本永遠對齊
  - 開一個 PR 就能看到全端改動
- **代價**：
  - 隨著專案變大，build time 會增加
  - 前端後端不能獨立部署（但現階段不需要）

---

## ADR-003: 為什麼用 Transaction 確保庫存一致性？

### Context
POS 系統的核心痛點：庫存資料不允許不一致。如果下單時扣庫存失敗、取消訂單時回補失敗，就會造成庫存錯亂。

### Decision
所有涉及庫存變動的操作（建立訂單、修改訂單、取消訂單、驗貨入庫）都必須包在 `better-sqlite3` 的 `db.transaction()` 內。

### Why better-sqlite3 over sqlite3?
| | better-sqlite3 | sqlite3 (async) |
|---|---|---|
| Transaction | 同步，自動 rollback | 需手動管理 async 邏輯 |
| 效能 | 快（sync，無 event loop overhead） | 中等 |
| 使用方式 | 直覺 sync call | callback/Promise |

對於 POS 這種需要強一致性的場景，sync transaction 的開發體驗和正確性都遠優於 async。

---

## ADR-004: 前台點餐用 SPA 而非 SSR？

### Context
前台是顧客點餐頁面，需要即時回應（加購物車、算總金額），後台是管理介面。

### Decision
前台和後台都是 SPA（Single Page Application），透過 React Router 管理路由。

- `/` 和 `/order` → 前台點餐頁
- `/admin/*` → 後台管理（含 Sidebar Layout）
- 前端開發時 proxy `/api` 到 backend:3000
- Production build 後由 Express 靜態 serve

這樣設計的優點是：開發階段前後端分離 hot reload，production 階段一個 port 搞定。