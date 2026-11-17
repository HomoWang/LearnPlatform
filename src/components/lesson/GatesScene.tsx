import type { GateStatus, GatesView } from "../../types";

const NUMBERS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

const statusText: Record<GateStatus, { symbol: string; label: string }> = {
  pass: { symbol: "✓", label: "通過" },
  fail: { symbol: "✕", label: "失敗" },
  idle: { symbol: "", label: "未執行" }
};

/** 綠色、紅色只表示通過／失敗，而且一定搭配符號與文字 */
function cellTone(status: GateStatus | undefined) {
  if (status === "pass") return "border-dba-deep bg-dba-tint";
  if (status === "fail") return "border-dev-deep bg-dev-tint";
  if (status === "idle") return "border-slate-300 bg-slate-100";
  return "border-slate-300 bg-white";
}

function Status({ status }: { status: GateStatus }) {
  const { symbol, label } = statusText[status];
  return (
    <span className={status === "idle" ? "text-slate-600" : "text-ink"}>
      {symbol ? (
        <span className={`mr-1 font-bold ${status === "pass" ? "text-dba-deep" : "text-dev-deep"}`} aria-hidden="true">
          {symbol}
        </span>
      ) : null}
      {label}
    </span>
  );
}

function Detail({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-1 text-[15px] leading-6 text-ink">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export default function GatesScene({ gates, view }: { gates: string[]; view: GatesView }) {
  const cell = (index: number) => {
    const status = view.status?.[index];
    const dimmed = view.emphasize && !view.emphasize.includes(index);
    const isFocus = view.focus === index;
    return {
      status,
      className: `rounded-md border ${cellTone(status)} ${isFocus ? "ring-2 ring-ink" : ""} ${
        dimmed ? "opacity-40" : ""
      } transition-[background-color,opacity] duration-300`
    };
  };

  return (
    <div>
      {/* 寬螢幕：七格橫排 */}
      <ol className="hidden grid-cols-7 gap-1.5 sm:grid">
        {gates.map((gate, index) => {
          const { status, className } = cell(index);
          return (
            <li key={gate} className={`${className} flex flex-col items-center px-1 py-2 text-center`}>
              <span className="text-[15px] text-slate-600" aria-hidden="true">
                {NUMBERS[index]}
              </span>
              <span className="mt-0.5 text-[15px] leading-5 text-ink">{gate}</span>
              {status ? (
                <span className="mt-2 text-[15px]">
                  <Status status={status} />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {view.detail ? (
        <div className="relative mt-4 hidden rounded-md border-2 border-ink bg-white p-3 sm:block">
          <span
            className="absolute -top-[9px] h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-ink bg-white"
            style={{ left: `${((view.detail.at + 0.5) / gates.length) * 100}%` }}
            aria-hidden="true"
          />
          <Detail lines={view.detail.lines} />
        </div>
      ) : null}

      {/* 窄螢幕：直向清單，說明顯示在被選的那一格裡 */}
      <ol className="space-y-1.5 sm:hidden">
        {gates.map((gate, index) => {
          const { status, className } = cell(index);
          return (
            <li key={gate} className={`${className} px-3 py-2`}>
              <div className="flex items-center justify-between gap-3 text-[15px]">
                <span className="text-ink">
                  <span className="mr-1.5 text-slate-600" aria-hidden="true">
                    {NUMBERS[index]}
                  </span>
                  {gate}
                </span>
                {status ? <Status status={status} /> : null}
              </div>
              {view.detail?.at === index ? (
                <div className="mt-2 border-t border-slate-300 pt-2">
                  <Detail lines={view.detail.lines} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
