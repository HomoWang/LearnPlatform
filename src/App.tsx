import { useEffect, useMemo, useState } from "react";
import Layout from "./components/Layout";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursesPage from "./pages/CoursesPage";
import Dashboard from "./pages/Dashboard";
import GlossaryPage from "./pages/GlossaryPage";
import InterviewPage from "./pages/InterviewPage";
import JobsPage from "./pages/JobsPage";
import LabDetailPage from "./pages/LabDetailPage";
import LabsPage from "./pages/LabsPage";
import NotesPage from "./pages/NotesPage";
import PathDetailPage from "./pages/PathDetailPage";
import PathsPage from "./pages/PathsPage";
import PortfolioPage from "./pages/PortfolioPage";
import SettingsPage from "./pages/SettingsPage";
import SkillsPage from "./pages/SkillsPage";
import type { AppActions } from "./lib/appActions";
import { upsertStatus } from "./lib/progress";
import {
  clearStoredState,
  downloadJson,
  emptyState,
  loadAppState,
  parseBackup,
  saveAppState,
  toBackupData
} from "./lib/storage";
import type {
  AppState,
  InterviewAnswer,
  Note,
  PortfolioItem,
  ProgressItemType,
  ProgressStatus,
  UserSettings
} from "./types";

function currentHashPath() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return "/";
  }
  return hash.startsWith("/") ? hash : `/${hash}`;
}

function useHashPath() {
  const [path, setPath] = useState(currentHashPath);

  useEffect(() => {
    const handleHashChange = () => setPath(currentHashPath());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return path;
}

function makeFreshEmptyState(): AppState {
  return {
    progress: [],
    notes: [],
    interviewAnswers: [],
    portfolioItems: [],
    settings: { ...emptyState.settings }
  };
}

export default function App() {
  const path = useHashPath();
  const [state, setState] = useState<AppState>(() => loadAppState());

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const actions = useMemo<AppActions>(
    () => ({
      updateProgress(itemId: string, itemType: ProgressItemType, status: ProgressStatus) {
        setState((previous) => ({
          ...previous,
          progress: upsertStatus(previous.progress, itemId, itemType, status)
        }));
      },
      saveNote(note: Note) {
        setState((previous) => {
          const exists = previous.notes.some((item) => item.id === note.id);
          return {
            ...previous,
            notes: exists
              ? previous.notes.map((item) => (item.id === note.id ? note : item))
              : [note, ...previous.notes]
          };
        });
      },
      deleteNote(noteId: string) {
        setState((previous) => ({
          ...previous,
          notes: previous.notes.filter((note) => note.id !== noteId)
        }));
      },
      saveInterviewAnswer(answer: InterviewAnswer) {
        setState((previous) => {
          const exists = previous.interviewAnswers.some(
            (item) => item.questionId === answer.questionId
          );
          return {
            ...previous,
            interviewAnswers: exists
              ? previous.interviewAnswers.map((item) =>
                  item.questionId === answer.questionId ? answer : item
                )
              : [...previous.interviewAnswers, answer]
          };
        });
      },
      savePortfolioItem(item: PortfolioItem) {
        setState((previous) => {
          const exists = previous.portfolioItems.some((portfolio) => portfolio.id === item.id);
          return {
            ...previous,
            portfolioItems: exists
              ? previous.portfolioItems.map((portfolio) =>
                  portfolio.id === item.id ? item : portfolio
                )
              : [item, ...previous.portfolioItems]
          };
        });
      },
      deletePortfolioItem(itemId: string) {
        setState((previous) => ({
          ...previous,
          portfolioItems: previous.portfolioItems.filter((item) => item.id !== itemId)
        }));
      },
      updateSettings(settings: UserSettings) {
        setState((previous) => ({
          ...previous,
          settings
        }));
      },
      exportBackup() {
        downloadJson("it-career-learning-backup.json", toBackupData(state));
      },
      importBackup(raw: string) {
        setState(parseBackup(raw));
      },
      resetProgress() {
        setState((previous) => ({
          ...previous,
          progress: []
        }));
      },
      clearAllData() {
        clearStoredState();
        setState(makeFreshEmptyState());
      }
    }),
    [state]
  );

  const pageProps = { state, actions };
  const route = path.split("/").filter(Boolean);

  function renderPage() {
    if (path === "/") {
      return <Dashboard {...pageProps} />;
    }

    if (path === "/paths") {
      return <PathsPage {...pageProps} />;
    }

    if (route[0] === "paths" && route[1]) {
      return <PathDetailPage {...pageProps} pathId={route[1]} />;
    }

    if (path === "/courses") {
      return <CoursesPage {...pageProps} />;
    }

    if (route[0] === "courses" && route[1]) {
      return <CourseDetailPage {...pageProps} courseId={route[1]} />;
    }

    if (path === "/labs") {
      return <LabsPage {...pageProps} />;
    }

    if (route[0] === "labs" && route[1]) {
      return <LabDetailPage {...pageProps} labId={route[1]} />;
    }

    if (path === "/skills") {
      return <SkillsPage {...pageProps} />;
    }

    if (path === "/glossary") {
      return <GlossaryPage />;
    }

    if (path === "/notes") {
      return <NotesPage {...pageProps} />;
    }

    if (path === "/interview") {
      return <InterviewPage {...pageProps} />;
    }

    if (path === "/jobs") {
      return <JobsPage {...pageProps} />;
    }

    if (path === "/portfolio") {
      return <PortfolioPage {...pageProps} />;
    }

    if (path === "/settings") {
      return <SettingsPage {...pageProps} />;
    }

    return (
      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-950">找不到頁面</h1>
        <p className="mt-2 text-sm text-slate-600">請從左側選單重新選擇功能。</p>
      </div>
    );
  }

  return <Layout currentPath={path}>{renderPage()}</Layout>;
}
