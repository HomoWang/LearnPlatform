import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TrayView } from "../../types";
import type { TrayLayout, TrayScene } from "./TrayScene";
import { useMediaQuery } from "./shared";

const SLOT_ORDER = ["A", "B", "C", "D", "M", "E"];

type Tag = { tray: number; at: string; name: string; leaving?: boolean };

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webglSupport = Boolean(gl);
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const tagsOf = (view: TrayView): Tag[] =>
  view.trays.flatMap((tray, t) => (tray.tags ?? []).map((tag) => ({ tray: t, at: tag.at, name: tag.name })));

/** 現在的分支標籤，加上剛被撕掉、正在淡出的標籤 */
function useTags(view: TrayView, animate: boolean): Tag[] {
  const previous = useRef(view);
  const [leaving, setLeaving] = useState<Tag[]>([]);
  useLayoutEffect(() => {
    const now = tagsOf(view);
    const gone = tagsOf(previous.current).filter(
      (old) => !now.some((tag) => tag.tray === old.tray && tag.name === old.name)
    );
    previous.current = view;
    if (!animate || gone.length === 0) {
      setLeaving([]);
      return;
    }
    setLeaving(gone.map((tag) => ({ ...tag, leaving: true })));
    const timer = window.setTimeout(() => setLeaving([]), 450);
    return () => window.clearTimeout(timer);
  }, [view, animate]);
  return [...tagsOf(view), ...leaving];
}

/** 每個托盤裡「這一格新出現的方塊」要延遲多久才出現（pull：先到快照，再到本機） */
function useArrivals(view: TrayView) {
  const previous = useRef<TrayView | null>(null);
  const prev = previous.current;
  useEffect(() => {
    previous.current = view;
  }, [view]);
  if (!prev) return new Map<string, number>();
  const delays = new Map<string, number>();
  view.trays.forEach((tray, t) => {
    for (const letter of tray.commits) {
      if (prev.trays[t]?.commits.includes(letter)) continue;
      let delay = 0;
      for (let s = t - 1; s >= 0; s -= 1) {
        if (!view.trays[s].commits.includes(letter)) break;
        if (!prev.trays[s]?.commits.includes(letter)) delay += 1;
      }
      delays.set(`${t}:${letter}`, delay);
    }
  });
  return delays;
}

function TagLabel({ name, leaving }: { name: string; leaving?: boolean }) {
  return (
    <span className={`flex flex-col items-center ${leaving ? "explainer-out" : ""}`}>
      <span className="whitespace-nowrap rounded border border-ink bg-white px-1.5 font-mono text-[15px] leading-6 text-ink">
        {name}
      </span>
      <span className="h-3 w-px bg-ink" />
    </span>
  );
}

/** 平面版：托盤直向堆疊，方塊是格子；互動與說明列和 3D 版完全相同 */
function FlatTrays({ view, animate, reserveTagSpace }: { view: TrayView; animate: boolean; reserveTagSpace: boolean }) {
  const tags = useTags(view, animate);
  const arrivals = useArrivals(view);

  const groups: number[][] = [];
  view.trays.forEach((tray, t) => {
    const last = groups[groups.length - 1];
    const framed = tray.state === "framed";
    if (framed && last && view.trays[last[0]].state === "framed") last.push(t);
    else groups.push([t]);
  });

  const cell = (t: number) => {
    const tray = view.trays[t];
    const focus = new Set(tray.focus ?? []);
    return (
      <div
        key={t}
        className={`rounded-md border border-slate-300 bg-slate-100 px-3 py-2 transition-opacity duration-300 ${
          tray.state === "dim" ? "opacity-40" : ""
        }`}
      >
        <div className="text-[15px] text-ink">{tray.label}</div>
        <div className={`mt-2 flex gap-1.5 ${reserveTagSpace ? "pt-10" : ""}`}>
          {SLOT_ORDER.filter((letter) => tray.commits.includes(letter)).map((letter) => {
            const tag = tags.find((item) => item.tray === t && item.at === letter);
            const delay = arrivals.get(`${t}:${letter}`);
            return (
              <div key={letter} className="relative">
                {tag ? (
                  <span key={tag.name + String(tag.leaving)} className="absolute bottom-full left-1/2 -translate-x-1/2">
                    <TagLabel name={tag.name} leaving={tag.leaving} />
                  </span>
                ) : null}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded bg-white text-base font-bold text-ink ${
                    focus.has(letter) ? "border-2 border-ink" : "border border-slate-400"
                  } ${animate && delay !== undefined ? "explainer-pop" : ""}`}
                  style={animate && delay ? { animationDelay: `${delay * 0.45}s` } : undefined}
                >
                  {letter}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {groups.map((group) =>
        view.trays[group[0]].state === "framed" ? (
          <div key={group[0]} className="space-y-2 rounded-lg border-2 border-ink p-1.5">
            {group.map(cell)}
          </div>
        ) : (
          cell(group[0])
        )
      )}
    </div>
  );
}

/** 3D 版：three.js 畫托盤與方塊，托盤名稱與分支標籤用網頁文字疊上去 */
function Trays3D({ view, animate, onFail }: { view: TrayView; animate: boolean; onFail: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TrayScene | null>(null);
  const viewRef = useRef(view);
  const [layout, setLayout] = useState<TrayLayout | null>(null);
  const tags = useTags(view, animate);

  // three.js 只在這個畫面出現時才下載；離開頁面時釋放
  useEffect(() => {
    let cancelled = false;
    import("./TrayScene")
      .then((module) => {
        if (cancelled || !containerRef.current) return;
        try {
          sceneRef.current = new module.TrayScene(containerRef.current, viewRef.current, setLayout);
        } catch {
          onFail();
        }
      })
      .catch(() => onFail());
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [onFail]);

  useEffect(() => {
    if (viewRef.current === view) return;
    viewRef.current = view;
    sceneRef.current?.setView(view, animate);
  }, [view, animate]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: "3.3 / 1" }}>
      {layout
        ? view.trays.map((tray, t) => {
            const at = layout.trays[t];
            return (
              <div
                key={t}
                className={`absolute z-10 -translate-x-1/2 text-center text-[15px] leading-5 text-ink transition-opacity duration-300 ${
                  tray.state === "dim" ? "opacity-40" : ""
                }`}
                style={{ left: at.x, top: at.y + 8, width: at.width }}
              >
                {tray.label}
              </div>
            );
          })
        : null}
      {layout
        ? tags.map((tag) => {
            const at = layout.cubes[tag.tray][SLOT_ORDER.indexOf(tag.at)];
            return (
              <span
                key={`${tag.tray}:${tag.name}:${String(tag.leaving)}`}
                className="absolute z-10 -translate-x-1/2 -translate-y-full"
                style={{ left: at.x, top: at.y + 2 }}
              >
                <TagLabel name={tag.name} leaving={tag.leaving} />
              </span>
            );
          })
        : null}
    </div>
  );
}

export default function TrayStage({ view, animate }: { view: TrayView; animate: boolean }) {
  const wide = useMediaQuery("(min-width: 640px)");
  const [failed, setFailed] = useState(false);
  const [reserveTagSpace] = useState(() => tagsOf(view).length > 0);
  const onFail = useRef(() => setFailed(true)).current;
  const use3D = wide && !failed && hasWebGL();
  return use3D ? (
    <Trays3D view={view} animate={animate} onFail={onFail} />
  ) : (
    <FlatTrays view={view} animate={animate} reserveTagSpace={reserveTagSpace} />
  );
}
