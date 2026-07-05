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
