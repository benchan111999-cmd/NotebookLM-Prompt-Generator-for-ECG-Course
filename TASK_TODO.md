# 📋 開發任務待辦清單

## Short-Term (立即行動) - 已完成與待辦

### ✅ 已完成 (Done)

| 任務 | 狀態 | 說明 |
|------|------|------|
| 模型升級 | ✅ 完成 | 將 `gemini-3-flash-preview` 升級為穩定版 `gemini-2.5-flash` |
| 安全修復 - 速率限制 | ✅ 完成 | 已實作 express-rate-limit (20 requests/15min per IP) |
| 安全修復 - 安全標頭 | ✅ 完成 | 已添加 Helmet 中間件 |
| 安全修復 - API Key 檢查 | ✅ 完成 | 移除硬編碼回退檢查 `MY_GEMINI_API_KEY` |
| 補全文件 - README.md | ✅ 完成 | README.md 已存在，包含 Node 22+ 要求說明 |
| 補全文件 - LICENSE | ✅ 完成 | LICENSE 檔案已存在 (MIT License) |
| 補全文件 - SECURITY.md | ✅ 完成 | SECURITY.md 檔案已存在 |
| 補全文件 - AGENTS.md | ✅ 完成 | AGENTS.md 檔案已建立 |
| 組件重構 | ✅ 完成 | App.tsx 從 566 行拆分為 194 行，使用 4 個獨立組件 |
| 提取 courseData | ✅ 完成 | 課程數據已提取至 `src/data/courseData.ts` |
| 共用 sanitize 函數 | ✅ 完成 | 建立 `src/shared/sanitize.ts`，前後端共用 |
| Error Boundary | ✅ 完成 | 新增錯誤邊界組件，監聽全域錯誤事件 |

### ⏳ 待完成 (To-Do)

| 任務 | 優先順序 | 說明 |
|------|----------|------|
| (無) | - | 所有 Short-Term 任務已完成 |

---

## Mid-Long Term (功能擴展) - 待辦

| 任務 | 優先順序 | 說明 |
|--------|----------|------|
| 多語言支持 | 低 | 引入 react-i18next 實現中英文輸出切換 |
| 本地歷史紀錄 | 低 | 使用 localStorage 或 IndexedDB 儲存生成的提示詞 |
| 智慧解析 | 低 | 實作 PDF 課程大綱自動解析功能 |

---

## 📊 總結

- **Short-Term 完成進度**: 12/12 (100%) ✅
- **待辦 (Short-Term)**: 0 項
- **待辦 (Mid-Long Term)**: 3 項

---

## ✅ 重構成果

### 組件結構
```
src/
├── components/
│   ├── ErrorBoundary.tsx      # 錯誤邊界 (新增)
│   ├── FocusEditor.tsx        # 自定義焦點輸入 + AI 精煉按鈕
│   ├── ModeSelector.tsx       # 授課/練習模式切換
│   ├── PromptOutput.tsx      # 生成的提示輸出 + 複製功能
│   └── TopicSelector.tsx     # 主題選擇 + 複雜度指示器
├── data/
│   └── courseData.ts         # 課程模組數據 (已外部化)
├── features/
│   └── prompt/
│       └── buildPrompt.ts    # Prompt 生成邏輯
├── shared/
│   ├── sanitize.ts           # 共用輸入清理函數
│   └── sanitize.test.ts      # 單元測試
└── App.tsx                   # 主應用 (從 566 行減少至 194 行)
```

### 重構成效
- **代碼行數減少**: 566 行 → 194 行 (減少 65%)
- **關注點分離**: 每個組件職責明確
- **可維護性提升**: 獨立檔案易於測試與更新
- **DRY 原則**: sanitize 函數已統一管理

---

## 下一步建議

所有 Short-Term 任務已完成！如需繼續開發，可以考慮：
1. **多語言支持** - 實現中英文切換
2. **本地歷史紀錄** - 儲存提示歷史
3. **智慧解析** - PDF 課程大綱自動解析

請告訴我您的下一步指示！