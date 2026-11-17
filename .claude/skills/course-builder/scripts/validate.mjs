// LearnPlatform seed data 驗證腳本
// 用法：在專案根目錄執行  node .claude/skills/course-builder/scripts/validate.mjs
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dataDir = resolve(process.cwd(), "src/data");
if (!existsSync(dataDir)) {
  console.error("找不到 src/data —— 請在專案根目錄執行本腳本。");
  process.exit(1);
}
const load = (f) => JSON.parse(readFileSync(resolve(dataDir, f), "utf8"));

const paths = load("learningPaths.json");
const courses = load("courses.json");
const labs = load("labs.json");
const skills = load("skills.json");
const interviews = load("interviewQuestions.json");
const jobs = load("jobMappings.json");
const teachings = load("lessonTeachings.json");
const glossary = load("glossary.json");

const pathIds = new Set(paths.map((p) => p.id));
const courseIds = new Set(courses.map((c) => c.id));
const labIds = new Set(labs.map((l) => l.id));
const skillIds = new Set(skills.map((s) => s.id));
const lessonIds = new Set(courses.flatMap((c) => c.lessons.map((l) => l.id)));

const errors = [];

// 1. 每個 lesson 有教學；每筆教學對應存在的 lesson
for (const id of lessonIds) if (!teachings[id]) errors.push(`lesson 缺教學內容: ${id}`);
for (const key of Object.keys(teachings)) if (!lessonIds.has(key)) errors.push(`教學無對應 lesson: ${key}`);

// 2. 課程 stage/pathId/order
for (const c of courses) {
  if (!pathIds.has(c.pathId)) errors.push(`course ${c.id} pathId 無效: ${c.pathId}`);
  const p = paths.find((x) => x.id === c.pathId);
  if (p && !p.stages.includes(c.stage)) errors.push(`course ${c.id} 的 stage 不在路線階段中: ${c.stage}`);
}
for (const p of paths) {
  const orders = courses.filter((c) => c.pathId === p.id).map((c) => c.order);
  if (new Set(orders).size !== orders.length) errors.push(`${p.id} 的 course order 重複: ${orders}`);
  for (const s of p.stages)
    if (!courses.some((c) => c.pathId === p.id && c.stage === s)) errors.push(`${p.id} 有空階段（沒有課程）: ${s}`);
}

// 3. Labs
for (const l of labs) {
  if (!pathIds.has(l.pathId)) errors.push(`lab ${l.id} pathId 無效`);
  if (l.courseId && !courseIds.has(l.courseId)) errors.push(`lab ${l.id} courseId 無效: ${l.courseId}`);
  if (l.stepGuides && l.stepGuides.length !== l.steps.length)
    errors.push(`lab ${l.id} 的 stepGuides 長度(${l.stepGuides.length})與 steps(${l.steps.length})不一致`);
}

// 4. Skills / Interview / Jobs 引用
for (const s of skills) {
  for (const c of s.relatedCourses) if (!courseIds.has(c)) errors.push(`skill ${s.id} course 無效: ${c}`);
  for (const l of s.relatedLabs) if (!labIds.has(l)) errors.push(`skill ${s.id} lab 無效: ${l}`);
}
for (const q of interviews) {
  if (!pathIds.has(q.pathId)) errors.push(`interview ${q.id} pathId 無效`);
  if (!q.relatedCourses?.length) errors.push(`interview ${q.id} 缺 relatedCourses（需求：面試題必須對應課程）`);
  for (const c of q.relatedCourses ?? []) if (!courseIds.has(c)) errors.push(`interview ${q.id} course 無效: ${c}`);
  for (const l of q.relatedLabs ?? []) if (!labIds.has(l)) errors.push(`interview ${q.id} lab 無效: ${l}`);
}
for (const j of jobs) {
  for (const s of j.relatedSkills) if (!skillIds.has(s)) errors.push(`job ${j.id} skill 無效: ${s}`);
  for (const c of j.relatedCourses) if (!courseIds.has(c)) errors.push(`job ${j.id} course 無效: ${c}`);
  for (const l of j.relatedLabs) if (!labIds.has(l)) errors.push(`job ${j.id} lab 無效: ${l}`);
}

// 5. 重複 ID / 重複名詞
const dup = (arr, label) => {
  const seen = new Set();
  for (const id of arr) {
    if (seen.has(id)) errors.push(`${label} 重複: ${id}`);
    seen.add(id);
  }
};
dup(courses.map((c) => c.id), "course id");
dup([...courses.flatMap((c) => c.lessons.map((l) => l.id))], "lesson id");
dup(labs.map((l) => l.id), "lab id");
dup(skills.map((s) => s.id), "skill id");
dup(interviews.map((q) => q.id), "interview id");
dup(jobs.map((j) => j.id), "job id");
dup(glossary.map((g) => g.term), "glossary term");

// 6. 動手做的速查與延伸說明（lessonTeachings 的 extras，選用）
for (const [lessonId, teaching] of Object.entries(teachings))
  for (const extra of teaching.extras ?? []) {
    const where = `extras ${lessonId} / ${extra.title ?? "(無標題)"}`;
    if (!extra.title) errors.push(`${where} 缺標題`);
    if (!extra.body && !extra.table) errors.push(`${where} 至少要有 body 或 table`);
    for (const row of extra.table?.rows ?? [])
      if (row.length !== extra.table.columns.length) errors.push(`${where} 表格有一列欄數與表頭不同: ${row[0]}`);
  }

// 7. 互動講解（lessonExplainers.json，選用；有寫的課才檢查）
const warnings = [];
const explainers = existsSync(resolve(dataDir, "lessonExplainers.json")) ? load("lessonExplainers.json") : {};
const sceneTypes = new Set(["graph", "file", "trays", "gates", "prod"]);
const trayLetters = new Set(["A", "B", "C", "D", "M", "E"]);
const cjkCount = (s) => (s.replace(/`[^`]*`/g, "").match(/[㐀-鿿]/g) ?? []).length;
const sentenceCount = (s) => s.split(/[。！？]/).filter((part) => part.trim()).length;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function framesOf(stage, where) {
  const c = stage.controls ?? {};
  const frames = [stage.initial];
  let count = 0;
  if (c.kind === "sequence" || c.kind === "either") {
    count = c.buttons?.length ?? 0;
    frames.push(...(c.buttons ?? []).map((b) => b.result));
  } else if (c.kind === "stepper") {
    count = 1;
    frames.push(...(c.steps ?? []));
  } else if (c.kind === "choice") {
    count = c.options?.length ?? 0;
    frames.push(...(c.options ?? []).map((o) => o.result));
    if (c.selected !== undefined) {
      if (!(c.selected >= 0 && c.selected < count)) errors.push(`${where} 預設選項超出範圍: ${c.selected}`);
      else if (!same(stage.initial, c.options[c.selected].result)) errors.push(`${where} 有預設選項時，初始畫面必須等於該選項的結果`);
    }
  } else if (c.kind === "choiceAction") {
    count = (c.options?.length ?? 0) + 1;
    frames.push(...(c.action?.results ?? []));
    if ((c.action?.results?.length ?? 0) !== c.options?.length) errors.push(`${where} 動作結果的數量要等於選項數`);
    if (!(c.selected >= 0 && c.selected < (c.options?.length ?? 0))) errors.push(`${where} 預設選項超出範圍: ${c.selected}`);
  } else errors.push(`${where} 控制類型不存在: ${c.kind}`);
  if (count < 1 || count > 3) errors.push(`${where} 控制要有 1～3 個（目前 ${count} 個）`);
  return frames;
}

function checkView(stage, view, where) {
  if (!view) return errors.push(`${where} 缺畫面`);
  if (stage.scene === "graph") {
    const shown = new Set(view.commits);
    for (const id of view.commits) if (!stage.layout[id]) errors.push(`${where} commit ${id} 不在 layout 裡`);
    for (const r of view.refs) if (!shown.has(r.at)) errors.push(`${where} 標籤 ${r.name} 貼在沒出現的 commit: ${r.at}`);
    if (view.here && !view.refs.some((r) => r.name === view.here)) errors.push(`${where}「你在這裡」要貼在畫面上的標籤旁: ${view.here}`);
    for (const f of view.focus ?? [])
      if (!shown.has(f) && !view.refs.some((r) => r.name === f)) errors.push(`${where} focus 指向畫面上沒有的東西: ${f}`);
  }
  if (stage.scene === "file")
    for (const i of view.marked ?? []) if (!(i >= 0 && i < view.lines.length)) errors.push(`${where} 亮起的行超出範圍: ${i}`);
  if (stage.scene === "trays")
    for (const tray of view.trays) {
      const commits = new Set(tray.commits);
      for (const c of tray.commits) if (!trayLetters.has(c)) errors.push(`${where} 托盤「${tray.label}」有不認得的方塊: ${c}`);
      for (const tag of tray.tags ?? []) if (!commits.has(tag.at)) errors.push(`${where} 標籤 ${tag.name} 貼在托盤裡沒有的方塊: ${tag.at}`);
      for (const f of tray.focus ?? []) if (!commits.has(f)) errors.push(`${where} focus 指向托盤裡沒有的方塊: ${f}`);
    }
  if (stage.scene === "gates") {
    const n = stage.gates.length;
    if (view.status && view.status.length !== n) errors.push(`${where} 關卡狀態數量(${view.status.length})與關卡數(${n})不同`);
    for (const i of [view.focus, view.detail?.at, ...(view.emphasize ?? [])])
      if (i !== undefined && !(i >= 0 && i < n)) errors.push(`${where} 關卡索引超出範圍: ${i}`);
  }
}

for (const [lessonId, ex] of Object.entries(explainers)) {
  const at = `explainer ${lessonId}`;
  if (!lessonIds.has(lessonId)) errors.push(`${at} 無對應 lesson`);
  if (!ex.question || !ex.outcome) errors.push(`${at} 缺問題（question）或「看完你能」（outcome）`);
  if (!(ex.minutes > 0)) errors.push(`${at} 缺預估分鐘數`);
  const cards = ex.cards ?? [];
  if (cards.length < 3 || cards.length > 4) errors.push(`${at} 概念卡要 3～4 張（目前 ${cards.length} 張）`);
  dup(cards.map((c) => `${lessonId}/${c.id}`), "explainer card id");
  cards.forEach((card, index) => {
    const where = `${at} / ${card.id}`;
    if (!card.title || !card.text) errors.push(`${where} 缺標題或說明`);
    const last = index === cards.length - 1;
    if (last && card.bridge) errors.push(`${where} 最後一張卡不放銜接句`);
    if (!last && !card.bridge) errors.push(`${where} 缺銜接句`);
    if (card.text && cjkCount(card.text) > 60) warnings.push(`${where} 說明超過 60 個中文字（${cjkCount(card.text)} 字）`);
    const stage = card.stage ?? {};
    if (!sceneTypes.has(stage.scene)) return errors.push(`${where} 畫面類型不存在: ${stage.scene}`);
    if (stage.scene === "graph")
      for (const [id, c] of Object.entries(stage.layout ?? {}))
        for (const parent of c.parents) if (!stage.layout[parent]) errors.push(`${where} commit ${id} 的上一步不存在: ${parent}`);
    const frames = framesOf(stage, where);
    frames.forEach((frame, i) => {
      const fw = `${where} 第 ${i} 格`;
      if (!frame?.caption) errors.push(`${fw} 缺說明列`);
      else if (sentenceCount(frame.caption) > 2) errors.push(`${fw} 說明列超過兩句: ${frame.caption}`);
      checkView(stage, frame?.view, fw);
    });
    if (stage.scene === "trays") {
      const n = stage.initial?.view?.trays?.length;
      if (frames.some((f) => f?.view?.trays?.length !== n)) errors.push(`${where} 同一張卡每一格的托盤數要相同`);
    }
  });
  if (ex.recap?.length !== 3) errors.push(`${at} 重點回顧要剛好三點`);
  const options = ex.quiz?.options ?? [];
  if (!ex.quiz?.question || options.length < 2) errors.push(`${at} 隨堂檢測缺題目或選項`);
  if (options.filter((o) => o.correct).length !== 1) errors.push(`${at} 隨堂檢測要剛好一個正確選項`);
  for (const o of options) if (!o.explanation) errors.push(`${at} 檢測選項缺解釋: ${o.text}`);
}

// 結果
if (errors.length) {
  console.log(`發現 ${errors.length} 個問題：`);
  for (const e of errors) console.log(" -", e);
  process.exit(1);
}

console.log("結構驗證全部通過 ✓");
console.log(
  `課程 ${courses.length} / 章節 ${lessonIds.size} / Lab ${labs.length} / 能力 ${skills.length} / 面試題 ${interviews.length} / 職缺對應 ${jobs.length} / 名詞 ${glossary.length}`
);

// 內容債報告：尚無 handson 的章節（按學習順序）
const missing = [];
for (const p of paths) {
  const pathCourses = courses.filter((c) => c.pathId === p.id).sort((a, b) => a.order - b.order);
  for (const c of pathCourses)
    for (const l of c.lessons)
      if (!teachings[l.id]?.handson) missing.push(`${p.id} > ${c.title} > ${l.title} (${l.id})`);
}
const done = lessonIds.size - missing.length;
console.log(`\n手把手解答覆蓋：${done}/${lessonIds.size} 章`);
if (missing.length) {
  console.log("尚無 handson 的章節（按學習順序，補內容時從最上面開始）：");
  for (const m of missing) console.log(" -", m);
}

console.log(`\n互動講解：${Object.keys(explainers).length}/${lessonIds.size} 課`);
if (warnings.length) {
  console.log("提醒（不算錯誤，請確認是刻意的）：");
  for (const w of warnings) console.log(" -", w);
}
