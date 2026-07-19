type ProgressBarProps = {
  value: number;
  label?: string;
  /** Tailwind class 指定填色，預設奶油黃；路線卡可傳 bg-net / bg-dba / bg-dev */
  fillClass?: string;
};

export default function ProgressBar({ value, label, fillClass = "bg-butter" }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label ?? "完成度"}</span>
        <span className="font-hn text-sm text-ink">{normalized}%</span>
      </div>
      <div className="h-3.5 rounded-full border-2 border-ink bg-white">
        <div
          className={`h-full rounded-full transition-all ${fillClass}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
