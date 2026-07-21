import type { ReactNode } from "react";

type LayoutProps = {
  currentPath: string;
  children: ReactNode;
};

type NavItem = { label: string; href: string; dotClass: string };
type NavGroup = { title?: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    items: [{ label: "首頁", href: "#/", dotClass: "bg-butter border-[1.5px] border-ink" }]
  },
  {
    title: "學 習",
    items: [
      { label: "學習路線", href: "#/paths", dotClass: "bg-net" },
      { label: "課程", href: "#/courses", dotClass: "bg-dba" },
      { label: "Lab 實作", href: "#/labs", dotClass: "bg-dev" }
    ]
  },
  {
    title: "練 功",
    items: [
      { label: "能力檢核", href: "#/skills", dotClass: "bg-slate-300" },
      { label: "面試題庫", href: "#/interview", dotClass: "bg-slate-300" },
      { label: "名詞字典", href: "#/glossary", dotClass: "bg-slate-300" }
    ]
  },
  {
    title: "求 職",
    items: [
      { label: "職缺對應", href: "#/jobs", dotClass: "bg-slate-300" },
      { label: "作品集", href: "#/portfolio", dotClass: "bg-slate-300" }
    ]
  },
  {
    title: "工 具",
    items: [
      { label: "AI 工具指南", href: "#/ai-tools", dotClass: "bg-butter border-[1.5px] border-ink" },
      { label: "我的筆記", href: "#/notes", dotClass: "bg-slate-300" },
      { label: "設定", href: "#/settings", dotClass: "bg-slate-300" }
    ]
  }
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
    <div className="min-h-screen lg:flex">
      <aside className="relative border-b-2 border-ink bg-slate-50 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r-2 lg:overflow-y-auto">
        {/* 活頁筆記本孔環（桌機才顯示） */}
        <div className="pointer-events-none absolute inset-y-0 right-[-13px] z-10 hidden w-[26px] flex-col justify-evenly lg:flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="h-[22px] w-[22px] rounded-full border-2 border-ink bg-paper shadow-[inset_2px_2px_0_rgba(69,58,47,.15)]"
            />
          ))}
        </div>

        <div className="px-4 pb-6 pt-6 lg:pr-8">
          <a href="#/" className="mx-1 inline-block -rotate-2 rounded-2xl border-2 border-ink bg-white px-4 py-2.5 shadow-sticker">
            <div className="font-hn text-lg leading-snug">我的學習手帳</div>
            <div className="mt-0.5 text-[11px] text-slate-500">企業 IT 轉職修煉中</div>
          </a>

          <nav className="mt-4">
            {navGroups.map((group, gi) => (
              <div key={gi} className="mt-4 first:mt-2">
                {group.title ? (
                  <div className="pl-3 text-[11px] tracking-[0.25em] text-slate-500">{group.title}</div>
                ) : null}
                {group.items.map((item) => {
                  const active = isActive(currentPath, item.href);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                        active
                          ? "border-2 border-ink bg-white font-hn shadow-sticker-sm lg:-mr-3"
                          : "border-2 border-transparent text-ink hover:bg-teal-100"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${item.dotClass}`} />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <main className="min-w-0 flex-1 lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
