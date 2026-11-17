import type { ProdView } from "../../types";

/** 代表一個環境的方塊：版本＋目前狀態（✓／✕ 一定搭配文字） */
export default function ProdScene({ view }: { view: ProdView }) {
  return (
    <div className="flex justify-center py-2">
      <div
        className={`w-full max-w-[280px] rounded-lg border px-5 py-4 text-center transition-colors duration-300 ${
          view.ok ? "border-dba-deep bg-dba-tint" : "border-dev-deep bg-dev-tint"
        } ${view.focus ? "ring-2 ring-ink" : ""}`}
      >
        <div className="text-[15px] text-slate-700">{view.title}</div>
        <div className="mt-1 font-mono text-2xl text-ink">{view.version}</div>
        <div className="mt-2 text-base text-ink">
          <span className={`mr-1 font-bold ${view.ok ? "text-dba-deep" : "text-dev-deep"}`} aria-hidden="true">
            {view.ok ? "✓" : "✕"}
          </span>
          {view.text}
        </div>
      </div>
    </div>
  );
}
