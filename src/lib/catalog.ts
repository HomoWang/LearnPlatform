import learningPathsData from "../data/learningPaths.json";
import coursesData from "../data/courses.json";
import labsData from "../data/labs.json";
import lessonTeachingsData from "../data/lessonTeachings.json";
import lessonExplainersData from "../data/lessonExplainers.json";
import skillsData from "../data/skills.json";
import interviewQuestionsData from "../data/interviewQuestions.json";
import jobMappingsData from "../data/jobMappings.json";
import glossaryData from "../data/glossary.json";
import type {
  Course,
  GlossaryEntry,
  InterviewQuestion,
  JobMapping,
  LabTask,
  LearningPath,
  Lesson,
  LessonExplainer,
  LessonTeaching,
  PathCategory,
  SkillItem
} from "../types";

export const learningPaths = learningPathsData as LearningPath[];
export const courses = coursesData as Course[];
export const labs = labsData as LabTask[];
export const skills = skillsData as SkillItem[];
export const interviewQuestions = interviewQuestionsData as InterviewQuestion[];
export const jobMappings = jobMappingsData as JobMapping[];
export const glossary = glossaryData as GlossaryEntry[];
export const lessonTeachings = lessonTeachingsData as Record<string, LessonTeaching>;
export const lessonExplainers = lessonExplainersData as unknown as Record<string, LessonExplainer>;

const asciiTermPattern = /^[A-Za-z0-9 .#+/-]+$/;

function termAppearsIn(term: string, text: string): boolean {
  if (asciiTermPattern.test(term)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, "i").test(text);
  }
  return text.includes(term);
}

export function findGlossaryInText(text: string): GlossaryEntry[] {
  return glossary
    .filter((entry) =>
      [entry.term, ...(entry.aliases ?? [])].some((candidate) => termAppearsIn(candidate, text))
    )
    .sort((a, b) => a.term.localeCompare(b.term, "zh-Hant"));
}

export const catalog = {
  learningPaths,
  courses,
  labs,
  skills,
  interviewQuestions,
  jobMappings
};

export function getLessonTeaching(lessonId: string) {
  return lessonTeachings[lessonId];
}

/** 該課的互動講解（沒有就回傳 undefined，課頁只顯示動手做的內容） */
export function getLessonExplainer(lessonId: string): LessonExplainer | undefined {
  return lessonExplainers[lessonId];
}

/** 該課完整的教學內容（courses.json 內嵌的欄位優先，其餘取 lessonTeachings.json） */
export function getFullTeaching(lesson: Lesson) {
  const teaching = getLessonTeaching(lesson.id);
  return {
    ...teaching,
    teachingSteps: lesson.teachingSteps ?? teaching?.teachingSteps,
    example: lesson.example ?? teaching?.example,
    practiceTasks: lesson.practiceTasks ?? teaching?.practiceTasks,
    beginnerChecklist: lesson.beginnerChecklist ?? teaching?.beginnerChecklist
  };
}

/** 預估分鐘數：有互動講解的用講解的設定；其餘依課文長度估（約每分鐘 350 字，取 5 的倍數） */
export function getLessonMinutes(lesson: Lesson): number {
  const explainer = getLessonExplainer(lesson.id);
  if (explainer) return explainer.minutes;
  const chars = collectStrings([lesson, getFullTeaching(lesson)]).join("").length;
  return Math.max(5, Math.ceil(chars / 350 / 5) * 5);
}

/** 把任意資料裡的所有字串攤平，供名詞字典比對 */
export function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

export function getPath(pathId: string) {
  return learningPaths.find((path) => path.id === pathId);
}

export function getPathByCategory(category: PathCategory) {
  return learningPaths.find((path) => path.category === category);
}

export function getCourse(courseId: string) {
  return courses.find((course) => course.id === courseId);
}

export function getLab(labId: string) {
  return labs.find((lab) => lab.id === labId);
}

export function getCoursesByPath(pathId: string) {
  return courses
    .filter((course) => course.pathId === pathId)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-Hant"));
}

export function getLabsByPath(pathId: string) {
  return labs.filter((lab) => lab.pathId === pathId);
}

export function getSkillsByPath(pathId: string) {
  return skills.filter((skill) => skill.pathId === pathId);
}

export function getInterviewByPath(pathId: string) {
  return interviewQuestions.filter((question) => question.pathId === pathId);
}

export function getJobsByPath(pathId: string) {
  return jobMappings.filter((job) => job.pathId === pathId);
}

export function getPathName(pathId?: string) {
  if (!pathId) {
    return "未指定";
  }

  return getPath(pathId)?.title ?? pathId;
}

export function collectTags(items: Array<{ tags?: string[] }>) {
  return Array.from(new Set(items.flatMap((item) => item.tags ?? []))).sort((a, b) =>
    a.localeCompare(b, "zh-Hant")
  );
}
