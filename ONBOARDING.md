# 金濠客食堂 POS — 組員 Onboarding

> ⏱️ 閱讀時間：5 分鐘  
> 📺 先看影片：[Git Branch 教學](https://youtu.be/P-nbNgIzlYE)  
> 📖 完整架構說明 → [README.md](README.md)

---

## 1｜環境安裝

```bash
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos
npm install
npm run db:init    # 建立資料表 + 測試資料
npm run dev        # → http://localhost:3100
```

**確認成功：**
```bash
curl http://localhost:3100/api/health
# → {"success":true,"data":{"status":"running"}}
```

入口：
- 前台點餐 → `http://localhost:3100`
- 後台管理 → `http://localhost:3100/admin/dashboard`

---

## 2｜技術棧（新手認知）

> 架構詳細說明在 [README.md](README.md) — 這裡只提最關鍵的新手困惑點

**Q: 我要寫前端還是後端？**  
A: Next.js API Routes 就是你的後端。前端（React component）call `/api/*` 就是 call 後端，不需要另外架伺服器。

**Q: API 怎麼寫？**  
A: 看 [docs/API-GUIDE.md](docs/API-GUIDE.md)，裡面有 6 個完整範例。**最重要的規則：所有 API 回傳 `{ success: true, data: ... }`**

**Q: Transaction 是什麼？**  
A: 當一個操作要同時寫入 ≥2 張表時（例如建訂單 + 扣庫存），必須包在 `db.transaction()` 裡，否則中途失敗會導致資料不一致。

---

## 3｜分工表

| 模組 | 負責人 | 文件 |
|------|--------|------|
| 前台點餐 + 後台 UI | Chuannnn | — |
| Menu API | Chuannnn | `docs/API.md` |
| Orders API | 待分配 | `docs/API.md` |
| Inventory API | 待分配 | `docs/API.md` |
| Purchase Orders API | 待分配 | `docs/API.md` |
| Dashboard Stats | 待分配 | `docs/API.md` |

---

## 4｜Git 工作流程

> 📺 **必看**：https://youtu.be/P-nbNgIzlYE

```bash
# Step 1: 從 main 開分支
git checkout main && git pull
git checkout -b feature/模組名

# Step 2: Commit（格式要對）
git add .
git commit -m "feat: 完成 XXX"
# feat = 新功能 / fix = 修 bug / docs = 文件 / refactor = 重構 / chore = 維護

# Step 3: Push 並開 PR
git push -u origin feature/模組名
# → 然後到 GitHub 開 Pull Request
```

**分支命名範例：**
```
feature/menu-crud       ✅
feature/orders-api      ✅
fix/inventory-bug       ✅
Menu_CRUD               ❌ 不要底線或中文
```

---

## 5｜Host 部署

### 方案 A：Tailscale 內網（推薦）

```bash
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos
npm install && npm run db:init

# 背景執行
nohup npm run dev > pos.log 2>&1 &

# 用 Tailscale 內網 IP 連線
# http://tailscale-ip:3100
```

### 方案 B：別台主機（需開機自啟）

```bash
npm install -g pm2
pm2 start npm --name "pos" -- dev
pm2 save
# 確認防火牆有開 port 3100
```

---

## 6｜外送員通知（Spec 已納入，暫不開發）

- **觸發點**：`PATCH /api/orders/:id/status` → `delivering`
- **實作方式**：n8n webhook（暫定）
- **通知方式**：待定（LINE / Telegram）
- **狀態**：⏳ 暫不開發，等需求確認再開工

---

## 🔗 快速連結

| 資源 | 連結 |
|------|------|
| Repo | https://github.com/Chuannnn1/jinhaoker-pos |
| 架構說明 | [README.md](README.md) |
| API 撰寫規範 | [docs/API-GUIDE.md](docs/API-GUIDE.md) |
| API 端點列表 | [docs/API.md](docs/API.md) |
| 技術選型理由 | [docs/ADR.md](docs/ADR.md) |
| Git 教學 | https://youtu.be/P-nbNgIzlYE |