import type {
  AppState,
  InterviewAnswer,
  Note,
  PortfolioItem,
  ProgressItemType,
  ProgressStatus,
  UserSettings
} from "../types";

export type AppActions = {
  updateProgress: (itemId: string, itemType: ProgressItemType, status: ProgressStatus) => void;
  saveNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  saveInterviewAnswer: (answer: InterviewAnswer) => void;
  savePortfolioItem: (item: PortfolioItem) => void;
  deletePortfolioItem: (itemId: string) => void;
  updateSettings: (settings: UserSettings) => void;
  exportBackup: () => void;
  importBackup: (raw: string) => void;
  resetProgress: () => void;
  clearAllData: () => void;
};

export type AppPageProps = {
  state: AppState;
  actions: AppActions;
};
