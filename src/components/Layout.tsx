import type { ReactNode } from "react";
import { learningPaths } from "../lib/catalog";

type LayoutProps = {
  currentPath: string;
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "#/" },
  { label: "學習路線", href: "#/paths" },
  { label: "課程", href: "#/courses" },
  { label: "Lab 實作", href: "#/labs" },
  { label: "能力檢核", href: "#/skills" },
  { label: "名詞字典", href: "#/glossary" },
  { label: "我的筆記", href: "#/notes" },
  { label: "面試題庫", href: "#/interview" },
  { label: "職缺對應", href: "#/jobs" },
  { label: "作品集", href: "#/portfolio" },
  { label: "設定", href: "#/settings" }
];

function isActive(currentPath: string, href: string) {
  const route = href.replace("#", "");
  if (route === "/") {
    return currentPath === "/";
  }

  return currentPath === route || currentPath.startsWith(`${route}/`);
}

export default function Layout({ currentPath, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72">
        <div className="flex min-h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <a href="#/" className="block">
              <div className="text-lg font-bold">IT Career Learning</div>
              <div className="mt-1 text-xs text-slate-300">Personal LMS for enterprise IT practice</div>
            </a>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive(currentPath, item.href)
                    ? "bg-teal-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="border-t border-white/10 px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">快速路線</div>
            <div className="mt-3 space-y-2">
              {learningPaths.map((path) => (
                <a
                  key={path.id}
                  href={`#/paths/${path.id}`}
                  className="block rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-teal-400 hover:text-white"
                >
                  {path.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
