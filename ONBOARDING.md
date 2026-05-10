# 金濠客食堂 POS — 組員 Onboarding 摘要

> ⏱️ 閱讀時間：5 分鐘
> 📺 先看影片：[Git Branch 教學](https://youtu.be/P-nbNgIzlYE)

---

## 1｜環境安裝

### 用什麼寫？
| 層 | 技術 | 為什麼用它 |
|----|------|-----------|
| 後端 | Node.js + Express | JS 組員都會，零配置 |
| 資料庫 | SQLite (`better-sqlite3`) | 不需另外裝 MySQL/PostgreSQL，一個檔案就搞定 |
| 前端 | React 18 + Vite | 速度快，HMR 熱更新，開發體驗好 |
| 樣式 | Tailwind CSS | Utility-first，不用寫一堆 CSS 檔案 |
| 圖表 | Recharts | 專門給 React 用的，文件清楚 |

### 安裝步驟

```bash
# 1. Clone 下來
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos

# 2. 一鍵安裝（自動裝後端 + 前端依賴 + 初始化資料庫）
bash scripts/setup.sh

# 3. 啟動（需要兩個終端機）
# Terminal 1 — 後端 (Port 3000)
cd backend && npm run dev

# Terminal 2 — 前端 (Port 5173)
cd frontend && npm run dev
```

### 確認成功
```bash
curl http://localhost:3000/api/health
# → {"success":true,"data":{"status":"running"}}
```
成功後打開瀏覽器：
- **前台點餐**：`http://localhost:5173`
- **後台管理**：`http://localhost:5173/admin/dashboard`

---

## 2｜分工與 API 規格

### 分工表

| 模組 | 誰做 | 看哪個檔案 |
|------|------|-----------|
| 前台點餐 + 後台管理 | Chuannnn + Atlas | — |
| **Menu CRUD** | **Chuannnn** | `docs/SPEC.md` |
| Orders | ⏳ 開放認領 | `docs/SPEC.md` |
| Inventory | ⏳ 開放認領 | `docs/SPEC.md` |
| Purchasing | ⏳ 開放認領 | `docs/SPEC.md` |
| Suppliers | ⏳ 開放認領 | `docs/SPEC.md` |

每個模組的 API 文件在 [`docs/API.md`](docs/API.md)，
功能規格在 [`docs/SPEC.md`](docs/SPEC.md)。

開始做功能之前，**先把這兩個檔案從頭到尾看過一遍**。

### API 風格（所有人必須遵守）

```javascript
// ✅ 成功
{ "success": true, "data": ... }

// ❌ 失敗
{ "success": false, "error": "錯誤原因" }
```

### Menu 模組 API 概覽（Chuannnn 負責）

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/menu` | 取得所有上架餐點 |
| GET | `/api/menu/categories` | 取得所有分類 |
| GET | `/api/menu/:id` | 取得單一品項 |
| POST | `/api/menu` | 新增餐點 |
| PUT | `/api/menu/:id` | 更新餐點 |
| DELETE | `/api/menu/:id` | 下架餐點 |

詳細格式 → [`docs/API.md`](docs/API.md)

---

## 3｜Git Branch → PR 工作流程

> 📺 **先看這支影片再看這段**：https://youtu.be/P-nbNgIzlYE

### 標準流程

```bash
# Step 1：確保在 main 分支，把最新程式拉下來
git checkout main
git pull origin main

# Step 2：從 main 開一條新 branch
# 命名規則：feature/功能名 或 fix/問題名
git checkout -b feature/menu-crud

# Step 3：開始寫 code...

# Step 4：完成後 commit
git add .
git commit -m "feat: 完成 Menu CRUD API"
# 格式說明：feat=新功能、fix=修 bug、docs=文件、refactor=重構

# Step 5：推到 GitHub
git push -u origin feature/menu-crud

# Step 6：到 GitHub 開 Pull Request
# https://github.com/Chuannnn1/jinhaoker-pos
# 點 "Compare & pull request"，描述你做了什麼，等 Review
```

### Branch 命名範例

```
feature/menu-crud          ✅
feature/order-status       ✅
fix/inventory-bug          ✅
docs/api-update            ✅
Menu_CRUD                  ❌ 不要用底線或中文
```

### PR 描述範本

```
## 做了什麼
- 完成 Menu 的新增、編輯、刪除 API

## 測試方式
- [ ] POST /api/menu 新增餐點成功
- [ ] GET /api/menu 能看到新餐點
- [ ] DELETE /api/menu/:id 可以下架

## 對應 SPEC
- docs/SPEC.md 的「Menu CRUD」章節
```

---

## ⚠️ 重要提醒

1. **不要在 main 分支直接改** — 所有改動都要經過 PR + Review
2. **先看 SPEC 再寫 code** — 避免做出來的東西不符合需求
3. **每個 API 都要包 try-catch** — 所有 route 都用 `next(err)` 丟給 errorHandler
4. **庫存變動一定要用 Transaction** — 任何扣庫存/回補庫存的操作都要包在 `db.transaction()`
5. **遇到問題就開 Issue** — 不要悶著頭自己猜

---

## 🔗 快速連結

| 資源 | 連結 |
|------|------|
| Repo 首頁 | https://github.com/Chuannnn1/jinhaoker-pos |
| 功能規格 | [docs/SPEC.md](docs/SPEC.md) |
| API 文件 | [docs/API.md](docs/API.md) |
| 技術選型理由 | [docs/ADR.md](docs/ADR.md) |
| Git 教學影片 | https://youtu.be/P-nbNgIzlYE |
| 組員分工說明 | [README.md 分工區塊](README.md#-團隊分工) |

有任何問題 → GitHub 開 Issue 或直接問！