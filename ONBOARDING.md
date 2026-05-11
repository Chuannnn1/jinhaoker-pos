# 金濠客食堂 POS — 組員 Onboarding 摘要

> ⏱️ 閱讀時間：5 分鐘
> 📺 先看影片：[Git Branch 教學](https://youtu.be/P-nbNgIzlYE)

---

## 1｜環境安裝

### 用什麼寫？

| 層 | 技術 | 為什麼用它 |
|----|------|-----------|
| 後端 API | **Next.js API Routes** | 頁面 + API 在同一個專案，一鍵啟動免跨域 |
| 資料庫 | **SQLite (better-sqlite3)** | 不需另外裝資料庫，一個檔案搞定 |
| 前端 | **Next.js App Router** | 檔案即路由，新增頁面就是新增資料夾 |
| 樣式 | **Tailwind CSS** | 不用寫大量 CSS，utility class 直接套用 |
| 圖表 | **Recharts** | React 專用，文件清楚，宣告式寫法 |

### 安裝步驟

```bash
# 1. Clone
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos

# 2. 安裝依賴
npm install

# 3. 初始化資料庫（建立資料表 + 測試資料）
npm run db:init

# 4. 啟動開發伺服器
npm run dev
# → http://localhost:3100
```

### 確認成功

```bash
curl http://localhost:3100/api/health
# → {"success":true,"data":{"status":"running"}}
```

打開瀏覽器：
- **前台點餐**：`http://localhost:3100`
- **後台管理**：`http://localhost:3100/admin/dashboard`

---

## 2｜API 撰寫規範（組員必看）

### 黃金原則

```javascript
// ✅ 成功
{ "success": true, "data": ... }

// ❌ 失敗
{ "success": false, "error": "清楚說明錯誤原因" }

// ❌ 絕對不要
{ "data": ... }                     // 少了 success
res.send("ok")                       // 不是 JSON
```

### 每個 API 都要包 try-catch

```javascript
export async function GET() {
  try {
    // 你的邏輯
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
```

### HTTP Status 使用方式

| 情境 | Status |
|------|--------|
| 成功，回傳資料 | `200` |
| 成功，建立資源 | `201` |
| 參數錯誤 | `400` |
| 找不到資源 | `404` |
| 伺服器錯誤 | `500` |

### 詳細 API 撰寫範例

完整的 API 撰寫指南（含 6 個完整範例）放在：

👉 **[docs/API-GUIDE.md](docs/API-GUIDE.md)**

裡面包含：
- GET 與路徑參數
- POST 建立資料
- PATCH 更新狀態
- DELETE 軟刪除
- Transaction 跨表寫入（最重要！）

---

## 3｜分工表

| 模組 | 負責人 | API 文件 | 頁面 |
|------|--------|---------|------|
| **前台點餐** | Chuannnn + Atlas | — | `/` |
| **後台管理** | Chuannnn + Atlas | — | `/admin/*` |
| **Menu CRUD** | **Chuannnn** | `GET/POST/PUT/DELETE /api/menu` | `/admin/menu` |
| **Orders** | ⏳ 待分配 | `docs/API.md#訂單管理-orders` | `/admin/orders` |
| **Inventory** | ⏳ 待分配 | `docs/API.md#庫存管理-inventory` | `/admin/inventory` |
| **採購管理** | ⏳ 待分配 | `docs/API.md#採購訂單-purchase-orders` | — |
| **供應商管理** | ⏳ 待分配 | `docs/API.md#供應商管理-suppliers` | — |
| **外送員通知** | ⏳ **spec 已納入，暫不開發** | — | — |

---

## 4｜Git 工作流程

> 📺 **必看影片**：https://youtu.be/P-nbNgIzlYE

```bash
# Step 1: 從 main 開分支
git checkout main
git pull origin main
git checkout -b feature/你的模組名

# Step 2: 寫完後 commit
git add .
git commit -m "feat: 完成 XXX API"

# 格式：
# feat: 新功能
# fix: 修 bug
# docs: 文件更新

# Step 3: 推上 GitHub
git push -u origin feature/你的模組名

# Step 4: 到 GitHub 開 Pull Request
# https://github.com/Chuannnn1/jinhaoker-pos
```

### Branch 命名範例

```
feature/menu-crud    ✅
feature/order-api    ✅
fix/inventory-bug    ✅
Menu_CRUD            ❌ 不要底線或中文
```

---

## 5｜Host 部署方案（參考）

目前有三個方案可選，視需求決定：

| 方案 | 方式 | 優點 | 缺點 |
|------|------|------|------|
| **A** | Tailscale 內網 (tailscale-ip:3100) | 不用開防火牆，安全 | 僅同個 VPN 內可連 |
| **B** | 別台主機 host | 可 24hr 開機 | 需設開機自啟 + 防火牆 |
| **C** | 本機開發用 | 最簡單 | 關機就沒了 |

### 方案 A：Tailscale 部署（推薦）

```bash
# 有裝 Tailscale 的機器上
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos
npm install
npm run db:init

# 背景執行
nohup npm run dev > pos.log 2>&1 &

# 用 Tailscale 內網 IP 連
# http://tailscale-ip:3100
```

### 方案 B：別台主機
```bash
# 同安裝步驟，但需確認：
# 1. 防火牆有開 port 3100
# 2. pm2 或 systemd 設定開機自啟
npm install -g pm2
pm2 start npm --name "pos" -- dev
pm2 save
```

---

## 6｜外送員通知（spec 已納入，暫不開發）

已在 `docs/SPEC.md` 中新增外送員模組：

- **功能**：訂單狀態到「外送中 (delivering)」時，通知外送員
- **實作方式**：**n8n 串接**（暫定）
- **觸發點**：`PATCH /api/orders/:id/status` 到 `delivering`
- **通知方式**：待確定（LINE / Telegram / WebSocket）
- **狀態**：⏳ 暫不開發，先放 spec

---

## 🔗 快速連結

| 資源 | 連結 |
|------|------|
| Repo | https://github.com/Chuannnn1/jinhaoker-pos |
| API 撰寫規範（含範例） | [docs/API-GUIDE.md](docs/API-GUIDE.md) |
| 功能規格 | [docs/SPEC.md](docs/SPEC.md) |
| API 端點文件 | [docs/API.md](docs/API.md) |
| 技術選型理由 | [docs/ADR.md](docs/ADR.md) |
| Git 教學影片 | https://youtu.be/P-nbNgIzlYE |

有任何問題 → GitHub 開 Issue 或直接問！