export type PathCategory = "network" | "dba" | "devops";

export type ProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "review"
  | "practical_ready"
  | "interview_ready";

export type ProgressItemType =
  | "course"
  | "lesson"
  | "lab"
  | "skill"
  | "interview"
  | "jobMapping";

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  category: PathCategory;
  level: "beginner" | "intermediate" | "advanced";
  stages: string[];
};

export type Course = {
  id: string;
  pathId: string;
  title: string;
  stage: string;
  description: string;
  businessUse: string;
  lessons: Lesson[];
  tags: string[];
  order: number;
};

export type Lesson = {
  id: string;
  title: string;
  objective: string;
  content: string;
  teachingSteps?: string[];
  example?: string;
  practiceTasks?: string[];
  beginnerChecklist?: string[];
  commonIssues: string[];
  troubleshooting: string[];
  interviewPoints: string[];
};

export type LabTask = {
  id: string;
  pathId: string;
  courseId?: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  objective: string;
  prerequisites: string[];
  steps: string[];
  stepGuides?: string[];
  completionCriteria: string[];
  commonErrors: string[];
  troubleshooting: string[];
  portfolioTemplate: string;
  tags: string[];
};

export type LessonTeaching = {
  teachingSteps?: string[];
  example?: string;
  practiceTasks?: string[];
  beginnerChecklist?: string[];
  handson?: string;
  /** 動手做分頁的速查與延伸說明（放在教學內容之後） */
  extras?: PracticeExtra[];
};

/** 一段速查或延伸說明：body 是多行文字（行首 `> ` 是指令、`| ` 是輸出，連續幾行會排成一塊），table 是速查表 */
export type PracticeExtra = {
  title: string;
  body?: string;
  table?: { columns: string[]; rows: string[][] };
  note?: string;
};

/* ───── 互動講解（lessonExplainers.json）───── */
/* 一課一頁、3～4 張概念卡；每張卡一個舞台（控制列＋畫面＋說明列）。
   畫面一律以「畫面描述（view）」宣告：初始一格、每個控制按下後各一格，元件只負責畫出來與補動畫。 */

/** 舞台的一格：畫面＋說明列（最多兩句） */
export type ExplainerFrame<V> = { view: V; caption: string };

/** Git 歷史圖（SVG）。位置寫在 stage.layout，畫面只列出現在看得到什麼 */
export type GraphView = {
  commits: string[];
  refs: { name: string; at: string }[];
  /** 「你在這裡」貼在哪一張分支標籤旁；省略＝不顯示 */
  here?: string;
  /** 目前這一步的物件（commit 代號或標籤名稱），加 2px 深色框 */
  focus?: string[];
};

/** 一個檔案的內容；marked 是亮起的行（從 0 起算） */
export type FileView = { lines: string[]; marked?: number[] };

/** 桌上的托盤（第 2 課，3D／平面版共用） */
export type TrayView = {
  trays: {
    label: string;
    /** 方塊代表 commit，依 A B C D M E 的順序排 */
    commits: string[];
    /** 貼在方塊上的分支標籤 */
    tags?: { at: string; name: string }[];
    /** 目前這一步新出現的方塊 */
    focus?: string[];
    /** dim＝變淡；framed＝被框起來（相鄰的會框在同一個框裡） */
    state?: "dim" | "framed";
  }[];
};

export type GateStatus = "pass" | "fail" | "idle";

/** 關卡流程圖（第 3 課） */
export type GatesView = {
  /** 每格狀態；省略＝不顯示狀態 */
  status?: GateStatus[];
  /** 目前這一步（格子索引） */
  focus?: number;
  /** 只強調這幾格，其餘變淡 */
  emphasize?: number[];
  /** 在某一格下方顯示的說明行 */
  detail?: { at: number; lines: string[] };
};

/** 單一環境方塊（第 3 課卡 4） */
export type ProdView = { title: string; version: string; ok: boolean; text: string; focus?: boolean };

export type ExplainerControls<V> =
  /** 依序各按一次：後一顆在前一顆按過之前停用，按過就停用 */
  | { kind: "sequence"; buttons: { label: string; result: ExplainerFrame<V> }[] }
  /** 任選一顆，按完全部停用 */
  | { kind: "either"; buttons: { label: string; result: ExplainerFrame<V> }[] }
  /** 同一顆按鈕按多次，每次往下一格；最後一格之後停用 */
  | { kind: "stepper"; label: string; steps: ExplainerFrame<V>[] }
  /** 單選；selected 有值時初始畫面＝該選項的結果 */
  | { kind: "choice"; label: string; options: { label: string; result: ExplainerFrame<V> }[]; selected?: number }
  /** 單選＋一顆動作鈕：切換選項回到初始畫面；動作的結果依選項而定 */
  | {
      kind: "choiceAction";
      label: string;
      options: string[];
      selected: number;
      action: { label: string; results: ExplainerFrame<V>[] };
    };

type StageOf<S extends string, V> = { scene: S; initial: ExplainerFrame<V>; controls: ExplainerControls<V> };

export type ExplainerStage =
  | (StageOf<"graph", GraphView> & {
      layout: Record<string, { col: number; lane: number; parents: string[] }>;
    })
  | StageOf<"file", FileView>
  | StageOf<"trays", TrayView>
  | (StageOf<"gates", GatesView> & { gates: string[] })
  | StageOf<"prod", ProdView>;

export type ExplainerCard = {
  id: string;
  /** 一句結論 */
  title: string;
  /** 這件事是什麼（行內可用 `code` 與 **粗體**） */
  text: string;
  stage: ExplainerStage;
  /** 銜接句（最後一張沒有） */
  bridge?: string;
};

export type LessonExplainer = {
  /** 這一課要回答的問題（大標，也顯示在課程頁） */
  question: string;
  /** 「看完你能：」後面的那句 */
  outcome: string;
  /** 「看完你能」下面的補充說明（選用） */
  note?: string;
  minutes: number;
  cards: ExplainerCard[];
  /** 重點回顧（三點） */
  recap: string[];
  quiz: { question: string; options: { text: string; correct?: boolean; explanation: string }[] };
};

export type GlossaryEntry = {
  term: string;
  aliases?: string[];
  category: "general" | "network" | "dba" | "devops";
  explanation: string;
};

export type UserProgress = {
  itemId: string;
  itemType: ProgressItemType;
  status: ProgressStatus;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  category: string;
  content: string;
  pathId?: string;
  relatedItemId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type SkillItem = {
  id: string;
  pathId: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  relatedCourses: string[];
  relatedLabs: string[];
};

export type InterviewQuestion = {
  id: string;
  pathId: string;
  type: "basic" | "troubleshooting" | "scenario" | "project";
  question: string;
  referenceAnswer: string;
  myAnswer?: string;
  tags: string[];
  relatedCourses?: string[];
  relatedLabs?: string[];
};

export type JobMapping = {
  id: string;
  pathId: string;
  requirement: string;
  relatedSkills: string[];
  relatedCourses: string[];
  relatedLabs: string[];
  learningGoal: string;
  interviewStatement: string;
};

export type PortfolioItem = {
  id: string;
  pathId: string;
  title: string;
  relatedLabs: string[];
  skills: string[];
  description: string;
  tools: string[];
  troubleshooting: string;
  resumeText: string;
  interviewText: string;
  createdAt: string;
  updatedAt: string;
};

export type InterviewAnswer = {
  questionId: string;
  answer: string;
  updatedAt: string;
};

export type UserSettings = {
  weeklyTarget?: number;
  defaultPathId?: string;
};

export type AppState = {
  progress: UserProgress[];
  notes: Note[];
  interviewAnswers: InterviewAnswer[];
  portfolioItems: PortfolioItem[];
  settings: UserSettings;
};

export type BackupData = AppState & {
  version: "1.0.0";
  exportedAt: string;
};
