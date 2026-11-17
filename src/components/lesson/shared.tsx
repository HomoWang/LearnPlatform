import { Fragment, useEffect, useState } from "react";

/** 行內格式：`程式碼` 與 **粗體**（資料裡只用這兩種） */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.92em] text-ink">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

/** 去掉行內格式符號（給 aria-label 用） */
export function plain(text: string) {
  return text.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** 舞台的一般控制鈕（白底細框；停用時灰底） */
export const actionButton =
  "rounded-md border border-slate-400 bg-white px-3 py-1.5 text-[15px] text-ink transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500";

/** 單選選項：選中時蜂蜜黃底＋2px 深色框 */
export function optionButton(selected: boolean) {
  return `rounded-md border-2 px-3 py-1.5 text-[15px] text-ink transition-colors ${
    selected ? "border-ink bg-butter" : "border-slate-300 bg-white hover:border-slate-500"
  }`;
}

/** 主要按鈕（全頁唯一用強調色的按鈕）與次要按鈕 */
export const primaryLink =
  "inline-flex items-center justify-center rounded-md border-2 border-ink bg-butter px-5 py-2.5 text-base text-ink hover:bg-teal-200";
export const secondaryLink =
  "inline-flex items-center justify-center rounded-md border border-slate-400 bg-white px-5 py-2.5 text-base text-ink hover:bg-slate-50";

/** 指令類的控制用等寬字 */
export const isCommand = (label: string) => label.startsWith("git ");
