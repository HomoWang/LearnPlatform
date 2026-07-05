import type { AppState, BackupData } from "../types";

const STORAGE_KEY = "it-career-learning-platform:v1";

export const emptyState: AppState = {
  progress: [],
  notes: [],
  interviewAnswers: [],
  portfolioItems: [],
  settings: {
    weeklyTarget: 5,
    defaultPathId: "network"
  }
};

export function loadAppState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      progress: Array.isArray(parsed.progress) ? parsed.progress : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      interviewAnswers: Array.isArray(parsed.interviewAnswers) ? parsed.interviewAnswers : [],
      portfolioItems: Array.isArray(parsed.portfolioItems) ? parsed.portfolioItems : [],
      settings: {
        ...emptyState.settings,
        ...(parsed.settings ?? {})
      }
    };
  } catch {
    return emptyState;
  }
}

export function saveAppState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toBackupData(state: AppState): BackupData {
  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    progress: state.progress,
    notes: state.notes,
    interviewAnswers: state.interviewAnswers,
    portfolioItems: state.portfolioItems,
    settings: state.settings
  };
}

export function parseBackup(raw: string): AppState {
  const parsed = JSON.parse(raw) as Partial<BackupData>;

  if (parsed.version !== "1.0.0") {
    throw new Error("不支援的備份版本");
  }

  return {
    progress: Array.isArray(parsed.progress) ? parsed.progress : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    interviewAnswers: Array.isArray(parsed.interviewAnswers) ? parsed.interviewAnswers : [],
    portfolioItems: Array.isArray(parsed.portfolioItems) ? parsed.portfolioItems : [],
    settings: {
      ...emptyState.settings,
      ...(parsed.settings ?? {})
    }
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function clearStoredState() {
  window.localStorage.removeItem(STORAGE_KEY);
}
