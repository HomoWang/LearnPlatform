# 資料模型與交叉引用規則

所有 seed data 在 `src/data/`，型別定義在 `src/types.ts`（改資料結構要同步改型別與對應頁面）。
進度存 localStorage、以 ID 為鍵——**既有 ID 永遠不要改名或刪除**，否則使用者進度會消失；新增內容用新 ID。

## 檔案總覽與依賴方向

```
learningPaths.json   路線（stages 清單）
  └─ courses.json         課程（stage 必須 ∈ 路線 stages）→ lessons（章節）
       ├─ lessonTeachings.json   教學內容（key = lesson id，每個 lesson 必須有一筆；含動手做的 extras）
       ├─ lessonExplainers.json  互動講解（key = lesson id，選用）
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
`Record<lessonId, { teachingSteps[], example, practiceTasks[], beginnerChecklist[], handson?, extras? }>`
- **每個 lesson id 必須有一筆**（validate 腳本會抓漏）。
- `handson` 是給小白的手把手解答（一個長字串、`\n` 換行，UI 以收合區塊顯示）。入門段章節必填，內容標準見 content-standards.md。

- `extras`（選用）：動手做分頁的「速查與延伸說明」，`[{ title, body?, table?, note? }]`。
  - `body` 是多行文字：行首 `> ` 是指令、`| ` 是輸出（連續幾行排成一塊），其他行是一般文字。
  - `table` 是速查表 `{ columns[], rows[][] }`，每列欄數要等於表頭；第一欄當列標題（等寬字）。
  - 互動講解規格裡「放在動手做分頁」的每一項，都寫成一個 extra。

### lessonExplainers.json（互動講解，選用）
`Record<lessonId, LessonExplainer>`。有寫的課，課頁有「講解」（預設，`#/courses/<課程>/<課>`）與「動手做」（`…/practice`）兩個分頁；沒寫的課，課頁只顯示動手做的內容、不顯示分頁列。型別在 `src/types.ts`（`LessonExplainer`、`ExplainerStage`、各種 `*View`），元件在 `src/components/lesson/`，頁面是 `src/pages/LessonPage.tsx`。

```
{ question, outcome, note?, minutes,
  cards: [{ id, title, text, stage, bridge? }],   // 3～4 張；最後一張沒有 bridge
  recap: [string, string, string],
  quiz: { question, options: [{ text, correct?, explanation }] } }   // 剛好一個 correct
```
- `question` 是大標，也顯示在課程頁的課卡上；`outcome` 接在「看完你能：」後面；`minutes` 是課程頁顯示的預估分鐘數（沒有講解的課依內容長度自動估）。
- 文字欄位可用行內格式：`` `程式碼` `` 與 `**粗體**`。
- `stage` = `{ scene, initial, controls, ... }`，**每一格畫面都寫在資料裡**：`initial` 是初始的一格，controls 裡每個控制按下後的結果各是一格。一格 = `{ view, caption }`，caption 是說明列（最多兩句）。元件只負責把 view 畫出來並補上動畫，沒寫的操作一律沒有效果（按鈕停用）。
- `controls.kind`（舞台的控制最多 3 個；右上角「↺ 重來」不算）：

| kind | 行為 | 資料 |
|---|---|---|
| `sequence` | 依序各按一次，後一顆在前一顆按過之前停用 | `buttons[{ label, result }]` |
| `either` | 任選一顆，按完全部停用 | `buttons[{ label, result }]` |
| `stepper` | 同一顆按多次，每次往下一格，最後一格後停用 | `label`、`steps[]` |
| `choice` | 單選 | `label`、`options[{ label, result }]`、`selected?`（有值時 `initial` 必須等於該選項的 result） |
| `choiceAction` | 單選＋一顆動作鈕；切換選項回到 `initial`，動作結果依選項 | `label`、`options[]`、`selected`、`action{ label, results[] }`（與 options 對齊） |

- `scene` 與它的 view：

| scene | 畫面 | view 欄位 | stage 額外欄位 |
|---|---|---|---|
| `graph` | Git 歷史圖（SVG） | `commits[]`、`refs[{ name, at }]`、`here?`（「你在這裡」貼在哪張標籤旁）、`focus?[]`（commit 或標籤，加 2px 深色框） | `layout{ id: { col, lane, parents[] } }` |
| `file` | 一個檔案 | `lines[]`、`marked?[]`（亮起的行，從 0 起算） | — |
| `trays` | 桌上的托盤（3D，窄螢幕或沒有 WebGL 時自動改平面版） | `trays[{ label, commits[], tags?[{ at, name }], focus?[], state?: "dim"\|"framed" }]`；方塊只能是 A B C D M E | — |
| `gates` | 關卡流程圖 | `status?[]`（pass/fail/idle，與關卡數相同）、`focus?`、`emphasize?[]`、`detail?{ at, lines[] }` | `gates[]`（關卡名稱） |
| `prod` | 單一環境方塊 | `title`、`version`、`ok`、`text`、`focus?` | — |

- 需要新的畫面類型時：在 `src/types.ts` 加 view 型別與 `ExplainerStage` 的一項 → `src/components/lesson/` 加元件 → `Stage.tsx` 的 `Scene` switch 加一行 → validate.mjs 的 `sceneTypes` 與 `checkView` 加檢查。three.js 的畫面一律用動態 `import()` 載入（見 `TrayStage.tsx`），離開頁面時要 `dispose()`，並提供相同內容的平面版。

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
6. extras 每項有標題、有 body 或 table；表格每列欄數等於表頭。
7. lessonExplainers 的 key 必須是存在的 lesson；3～4 張卡、只有最後一張沒有銜接句；每個舞台 1～3 個控制、每格說明列最多兩句；畫面裡的引用（commit、標籤、「你在這裡」、行號、關卡索引、托盤方塊）必須有效；重點回顧剛好三點、檢測剛好一個正確選項且每個選項有解釋。說明超過 60 個中文字只列為「提醒」。
