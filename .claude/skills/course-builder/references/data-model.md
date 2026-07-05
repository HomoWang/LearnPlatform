# 資料模型與交叉引用規則

所有 seed data 在 `src/data/`，型別定義在 `src/types.ts`（改資料結構要同步改型別與對應頁面）。
進度存 localStorage、以 ID 為鍵——**既有 ID 永遠不要改名或刪除**，否則使用者進度會消失；新增內容用新 ID。

## 檔案總覽與依賴方向

```
learningPaths.json   路線（stages 清單）
  └─ courses.json         課程（stage 必須 ∈ 路線 stages）→ lessons（章節）
       ├─ lessonTeachings.json   教學內容（key = lesson id，每個 lesson 必須有一筆）
       ├─ labs.json              Lab（courseId → 課程）
       ├─ skills.json            能力項目（relatedCourses / relatedLabs）
       ├─ interviewQuestions.json 面試題（relatedCourses / relatedLabs 必填）
       └─ jobMappings.json       職缺對應（relatedSkills / relatedCourses / relatedLabs）
glossary.json        名詞字典（獨立；由頁面自動比對內文顯示）
```

## 各檔案 schema 重點

### learningPaths.json
`{ id, title, description, category: "network"|"dba"|"devops", level, stages: string[] }`
- **stages 與該路線課程的 stage 欄位必須一一對應**：每個 stage 至少一門課、每門課的 stage 必須在清單裡。不允許「規劃了階段但沒有課」。
- 新增第四條路線時 category 型別（`src/types.ts` 的 PathCategory）要同步擴充，並檢查各頁面寫死的路線下拉選單（InterviewPage 等）。

### courses.json
`{ id, pathId, title, stage, description, businessUse, lessons[], tags[], order }`
- `businessUse` 必填：一段話講清楚「企業為什麼需要這個技能、維運現場什麼時候用到」。
- `order` 在同路線內唯一，決定顯示順序；第 0 課（環境準備）order = 1。
- lesson：`{ id, title, objective, content, commonIssues[], troubleshooting[], interviewPoints[] }`
  - objective 用能力句：「能～」開頭。
  - content 2–4 句，描述這章教什麼與企業情境。
  - **教學內容（teachingSteps/example/practiceTasks/beginnerChecklist）不要內嵌在 courses.json**——歷史上曾雙來源分歧，現在單一來源是 lessonTeachings.json。

### lessonTeachings.json
`Record<lessonId, { teachingSteps[], example, practiceTasks[], beginnerChecklist[], handson? }>`
- **每個 lesson id 必須有一筆**（validate 腳本會抓漏）。
- `handson` 是給小白的手把手解答（一個長字串、`\n` 換行，UI 以收合區塊顯示）。入門段章節必填，內容標準見 content-standards.md。

### labs.json
`{ id, pathId, courseId, title, difficulty: "easy"|"medium"|"hard", objective, prerequisites[], steps[], stepGuides?[], completionCriteria[], commonErrors[], troubleshooting[], portfolioTemplate, tags[] }`
- `stepGuides` 與 steps **按索引對齊、長度相同**（每步一段「怎麼做」，UI 收合顯示）。
- `portfolioTemplate`：第一人稱、可直接貼履歷的一段話（「我建立了…，涵蓋…，能…」）。
- `completionCriteria` 要可自我驗證（「能說明 X」「有一份 Y 紀錄」），不要寫「理解 X」。

### skills.json
`{ id, pathId, title, description, level, relatedCourses[], relatedLabs[] }`
- title 用自評句：「我能～」。每門新課至少對應 1–2 個能力項目。

### interviewQuestions.json
`{ id, pathId, type: "basic"|"troubleshooting"|"scenario"|"project", question, referenceAnswer, tags[], relatedCourses[], relatedLabs[] }`
- relatedCourses / relatedLabs 必填（需求：面試題要能連回課程與 Lab）。
- 四種題型在每條路線要分佈平衡，不要讓單一主題霸佔（歷史教訓：網路路線曾 9 題有 6 題是 Proxy）。
- referenceAnswer 2–4 句、可背誦、含排查順序或對比。

### jobMappings.json
`{ id, pathId, requirement, relatedSkills[], relatedCourses[], relatedLabs[], learningGoal, interviewStatement }`
- requirement 直接用 JD 的語言；interviewStatement 是第一人稱面試話術。

### glossary.json
`{ term, aliases?[], category: "general"|"network"|"dba"|"devops", explanation }`
- explanation 1–2 句白話，能用比喻就用比喻；term 不可重複。
- 顯示機制：`src/lib/catalog.ts` 的 `findGlossaryInText()` 自動掃描章節/Lab 內文比對 term 與 aliases——**英文 term 用字界比對**（"CA" 不會誤中 "SCA"），中文用子字串。所以寫新內容時名詞拼法要與字典一致（含大小寫不拘、但拼字要同）。
- 相近的一組概念可合併成一條（如「Dirty Read / Non-repeatable Read / Phantom Read」用 aliases 涵蓋）。

## 交叉引用鐵律（validate.mjs 全部會檢查）

1. 每個 lesson 有 lessonTeachings 條目；每個 teachings key 對應存在的 lesson。
2. 課程 stage ∈ 所屬路線 stages；每個 stage 至少一門課；order 同路線內不重複。
3. labs.courseId、skills/interview/jobMappings 的所有 related* ID 必須存在。
4. 所有 id 不重複；glossary term 不重複。
5. stepGuides 存在時長度必須等於 steps。
