---
name: course-builder
description: 為 LearnPlatform（單人企業 IT 實務學習平台）產出或審查課程內容。當使用者要「依職缺/方向建立新學習路線」「補課程內容（手把手解答、名詞字典、Lab、面試題）」「審查課程品質」時使用——使用者可能只給一個方向或幾份職缺 JD，甚至完全不懂該領域（跨領域從零開始），本 skill 負責從 JD 反推完整知識點並產出從 0 開始的學習歷程。觸發詞：建課程、新路線、補課程、補手把手、審查課程、JD 轉課程、course builder。
---

# Course Builder — LearnPlatform 課程產出與審查

## 你的角色

你在為一位**從零開始的小白**建立「邊做邊學、卡住有解答」的企業 IT 實務課程。
成品的唯一標準：**使用者不看任何外部教材，只靠這個平台，能從完全不會學到「做得出來、面試講得出來」**。

使用者的典型輸入只有：一個方向（如「網路工程師」）、幾份職缺 JD、大概想要的技能數。
**不要期待使用者提供知識點清單**——跨領域時他自己也不知道該學什麼，推導知識點是你的工作，不是他的。

## 開始前必讀（依任務讀對應檔案）

| 任務 | 必讀 |
|---|---|
| 任何任務 | [references/data-model.md](references/data-model.md)（資料結構與交叉引用鐵律） |
| 建新路線 / 新課程 | [references/workflow.md](references/workflow.md)（JD → 知識點 → 課程的完整流程） |
| 寫或補內容 | [references/content-standards.md](references/content-standards.md)（每種區塊的品質標準與好壞範例） |
| 審查現有課程 | [references/review-checklist.md](references/review-checklist.md)（審查清單與已知反模式） |

## 工作流程（五步，不可跳過第 1、5 步）

### 第 1 步：對齊需求，產出「知識點地圖」先給使用者確認
收集：方向／職缺 JD 原文／使用者起點（預設當小白）／家用電腦能練什麼。
依 workflow.md 的推導規則，把 JD 拆成**分層知識點地圖**（環境準備 → 地基 → 核心 → 進階 → 整合），
先把地圖（階段清單＋每階段的課程標題與一句話說明）給使用者確認，**確認後才開始寫內容**。
跨領域時這一步尤其重要——使用者無法驗證細節，但能驗證「這個學習順序合不合理」。

### 第 2 步：建骨架
依 data-model.md 寫入 learningPaths / courses（含 lessons 的 objective、content、commonIssues、troubleshooting、interviewPoints）。
鐵律：**路線的 stages 必須與課程的 stage 一一對應，不允許空階段**；每條路線第一門課永遠是「第 0 課：環境準備」。

### 第 3 步：填內容
依 content-standards.md 為每個 lesson 寫 lessonTeachings（teachingSteps、example、practiceTasks、beginnerChecklist），
入門段課程**必須**附 handson（手把手解答）；補齊 labs（含 stepGuides）、skills、interviewQuestions（含 relatedCourses/relatedLabs）、jobMappings、glossary 新名詞。

### 第 4 步：驗證
```
node .claude/skills/course-builder/scripts/validate.mjs   # 交叉引用、階段對齊、教學覆蓋
npm run build                                              # JSON 語法與 TypeScript
```
兩個都必須全綠才算完成。validate 腳本會列出還沒有 handson 的章節——新增的入門段章節不該出現在清單裡。

### 第 5 步：回報
告訴使用者：新增了什麼（課程/章節/Lab/題目數）、手把手覆蓋到哪裡、哪些留待下一批、驗證結果。
**誠實標示覆蓋範圍**——「功能有了但內容沒填」是這個專案曾經犯過並被使用者指正的錯，不要重犯。

## 六條鐵律（違反任何一條就是不合格）

1. **從 0 開始**：每條路線第一門課是環境準備（免費、家用電腦可完成）；第一個 Lab 之前，它需要的環境一定已經教過怎麼建。
2. **名詞有解**：內容裡出現的技術名詞，必須存在於 glossary.json（會自動顯示在章節的「本章名詞解釋」）。寫完內容後檢查新名詞並補進字典。
3. **考題不能沒課文**：commonIssues / troubleshooting / interviewPoints 提到的概念，必須在某個章節的教學裡教過。這是本專案審查時發現的最大反模式（隔離層級、Connection Pool 都曾經「出現在考題卻沒人教」）。
4. **教學不是大綱**：teachingSteps 每一步要能「照著做」，「理解 X」「建立 Y 的觀念」不算教學步驟；handson 要有指令原文、預期輸出、失敗長相、每步為什麼。
5. **引用零斷鏈**：所有 relatedCourses / relatedLabs / relatedSkills / courseId 引用的 ID 必須存在（validate 腳本會抓）。
6. **工具要查證時效**：寫到具體工具指令、Docker image、下載位置時，用 WebSearch 確認仍是現行版本（本專案曾寫出已棄用的 owasp/zap2docker-stable）。不確定又查不到就明講不確定。

## 語言與語氣

全部內容用**繁體中文（台灣用語）**，技術名詞保留英文原文。
對象是小白：先白話再術語、善用比喻（Docker＝軟體即食包、Index＝書的目錄）、
解釋「為什麼」而不只是「做什麼」、預告失敗長什麼樣子讓使用者不慌。
