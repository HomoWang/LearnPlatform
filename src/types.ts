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
