# 🌿 協作規範 (Contributing Guide)

## Git Branch Strategy

```
main           ← 穩定版本，只從 feature PR merge
  └── feature/menu      ← 菜單模組
  └── feature/orders    ← 訂單模組
  └── feature/inventory ← 庫存模組
  └── fix/*             ← Bug 修復
```

## Branch 命名

```bash
git checkout -b feature/your-module-name
git checkout -b fix/short-description
```

## Commit Message 格式

```bash
feat: 新增菜單 CRUD API
fix: 修復訂單取消時庫存回補錯誤
docs: 更新 API 文件
refactor: 重構 menuService 邏輯
```

## Pull Request 流程

1. 從 `main` 開 feature branch
2. 實作該模組的 route + service
3. 確保 API 回傳格式正確（`{ success, data/error }`）
4. 發 PR 到 `main`，標題格式：`[模組] 簡短說明`
5. 等 code review 通過後 merge
6. merge 後刪除 branch

## PR Template

```markdown
## 變更說明
- 實作了哪個 module
- 新增了哪些 API endpoints

## 驗證項目
- [ ] `npm run dev` 啟動正常
- [ ] API 回傳 `{ success, data }` 格式
- [ ] 跨表寫入在 transaction 內
- [ ] 有用 try-catch 處理錯誤

## 相關文件
- [docs/API.md](docs/API.md) 已更新
```

## 程式碼規範

- **ESLint**: 使用 standard style
- **API 回傳格式**: 一律 `{ success: true, data: ... }` 或 `{ success: false, error: "..." }`
- **Transaction**: 只要涉及庫存變動，必須用 `db.transaction()`
- **錯誤處理**: 每個 route handler 用 try-catch
- **型別**: 避免 `any`，使用 JSDoc 或 TypeScript（未來）