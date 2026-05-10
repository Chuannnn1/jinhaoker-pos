# 金濠客食堂 POS — Next.js 架构决策记录

## ADR-001: 為什麼選 Next.js 14？

### Context
我們需要一個單一單位的解決方案，使得前端和後端可以統一部署和維護。Team 希望能快速開始開發，減少 DevOps 複雜度。

### Decision
使用 Next.js 14 App Router 作為全端解決方案。

| 層面 | 選擇 | 替代方案 | 理由 |
|------|------|----------|------|
| 後端框架 | **Next.js API Routes** | Express, NestJS | 單一專案，零配置，API 路由即檔案 |
| 資料庫 | **SQLite (better-sqlite3)** | PostgreSQL, MySQL | 零安裝、單一檔案、不需 Docker |
| 前端框架 | **Next.js App Router** | React + Vite, Express + React | SSR/SSG 支援，更好的 SEO，檔案即路由 |
| 樣式 | **Tailwind CSS** | Bootstrap, styled-components | Utility-first，開發快，體積小 |
| 圖表 | **Recharts** | Chart.js, ApexCharts | React-native，NPM 包大小適中 |

### Trade-offs

- **Next.js vs Express**：Next.js 的 API Constraints 較多（必須是 async），但開發體驗更훌 contextual（API 和頁面在同一專案）。
- **SQLite vs PostgreSQL**：同 ADR-003，單店 POS 不需要 PostgreSQL。
- **App Router vs Pages Router**：App Router 是 Next.js 未來方向，雖然是 beta 但生態已成主流。

### Consequences

- **好處**：
  - 一個 `npm run dev` 搞定全部
  - 不需要處理跨域問題（CORS）
  - 支援 SSR/SSG（SEO 友好）
  - 預見到升級到 Vercel 效率極高
  
- **代價**:
  - 需了解 App Router 概念
  - Server/Client 元件需明確標註

### 相關文件
- [https://nextjs.org/docs](https://nextjs.org/docs)
- [https://nextjs.org/docs/app](https://nextjs.org/docs/app)

## ADR-002: 資料庫路線（PATH）

### Decision
- **Development**: `./data/jinhaoker.db`
- **Production**: 透過 `process.env.DB_PATH` 自定義

由於 Next.js 常見的 server less 環境（Vercel 等），SQLite 不適合。但我們的目標是本地部署或單機 VPS，因此使用 SQLite 仍然合適。

## ADR-003: better-sqlite3 vs Prisma/Drizzle

### Decision
使用 `better-sqlite3` 而非 ORM。

- **同步 API**：Transactions 自然寫法，不需要 nested async/await
- **體積小**：1.1MB vs Prisma 的 200MB+
- **零依賴**：不需要 CLI，不需要 migration 工具

### Trade-offs
- 沒 migration 功能 → 自己管理 Schema
- 需要手動 valdiation → 自己寫 check

對單店 POS 來說足夠了。

---

*最後更新: 2026-05-10*