# AGENTS.md - Repository Instructions
# AGENTS.md - 倉庫操作指南

## 設定 (Setup)

1. 安裝依賴套件: `npm install`
2. 從 `.env.example` 建立 `.env.local` 並設定 `GEMINI_API_KEY`

## 執行應用程式 (Running the Application)

### 開發模式 (Development)
- 執行後端 API (將 Gemini Key 保持在客戶端套件外): `npm run dev:server`
- 執行前端應用程式: `npm run dev`

### 生產建置 (Production Build)
- 建置生產版本: `npm run build`

## 架構 (Architecture)

這是一個 React + Vite 應用程式，搭配 Express 後端。

### 後端 (Backend)
- Express 伺服器位於 `server/index.ts`
- 提供安全的 Gemini API Key 端點
- **禁止**使用前輛 `VITE_` 前輛來儲存 API Key。Vite 會將這些變數暴露到瀏覽器 JavaScript 中。

### 前端 (Frontend)
- React 應用程式位於 `src/` 目錄
- 主要進入點: `src/main.tsx`
- 主 App 組件: `src/App.tsx`

## 關鍵實作細節 (Key Implementation Details)

1. 應用程式有一個後端 API 端點 (`/api/refine-focus`)，使用 Gemini API 來精煉焦點提示
2. 前端根據選定的 ECG 課程模組和主題生成 NotebookLM 提示
3. 預設前端執行於連接埠 3000，後端執行於連接埠 8787
4. 後端使用 `tsx` 執行伺服器: `tsx server/index.ts`

## 部署 (Deployment)

已配置 GitHub Actions CI/CD，自動部署至 GitHub Pages。

## 安全 (Security)

- `GEMINI_API_KEY` 儲存在後端，永遠不會暴露到客戶端套件
- 應用程式遵循安全最佳實踐，不使用 `VITE_` 前輛的環境變數

## 命令 (Commands)

- 開發: `npm run dev` 和 `npm run dev:server`
- 建置: `npm run build`
- 型別檢查: `npm run lint`
- 預覽: `npm run preview`
- 清理: `npm run clean`

## 風格 (Style)

- 使用 Tailwind CSS 進行样式設計
- 遵循現代化的 React 18 組件化架構
- 使用 Vite 作為建置工具

## Git 工作流程 (Git Workflow)

### 拉取請求工作流程 (Pull Request Workflow)

**重要**: 所有功能開發必須遵循此工作流程，禁止直接推送到 main 分支。

1. **拉取最新變更**
   ```bash
   git pull origin main
   ```

2. **建立功能分支**
   ```bash
   git checkout -b feature/功能名稱
   ```

3. **開發與提交**
   - 進行程式碼開發
   - 提交變更到功能分支

4. **推送分支**
   ```bash
   git push origin feature/功能名稱
   ```

5. **建立拉取請求**
   - 前往 GitHub 建立 PR
   - 等待審核後合併

### 提交前檢查清單 (Pre-Commit Checklist)

在執行 `git commit` 之前，必須完成以下檢查：

- [ ] 程式碼已通過型別檢查: `npm run lint`
- [ ] 專案可以成功建置: `npm run build`
- [ ] **TASK_TODO.md 已更新** - 標記完成的任務
- [ ] 確認所有變更已暫存 (staged)

### 更新待辦清單 (Update Todo List)

每次完成任務後，必須更新 `TASK_TODO.md`：

1. 將完成的任務從「待完成」移至「已完成」
2. 更新進度百分比
3. 在提交訊息中註明已更新 todo list

### 禁止事項

- **嚴禁**直接推送到 main 分支
- **嚴禁**在未更新 TASK_TODO.md 的情況下提交