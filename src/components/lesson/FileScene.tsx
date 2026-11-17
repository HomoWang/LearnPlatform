import type { FileView } from "../../types";

/** 一個檔案；亮起的那幾行用 2px 深色框圈起來 */
export default function FileScene({ view }: { view: FileView }) {
  const marked = new Set(view.marked ?? []);
  // 把連續的行分段：亮起的一段一個框，其他行保留同樣的框寬，切換時文字不會跳動
  const runs: { marked: boolean; lines: { text: string; index: number }[] }[] = [];
  view.lines.forEach((text, index) => {
    const isMarked = marked.has(index);
    const last = runs[runs.length - 1];
    if (last && last.marked === isMarked) last.lines.push({ text, index });
    else runs.push({ marked: isMarked, lines: [{ text, index }] });
  });

  return (
    <div className="overflow-x-auto rounded-md border border-slate-300 bg-white py-2 font-mono text-[15px] leading-7 text-ink">
      {runs.map((run) => (
        <div
          key={run.lines[0].index}
          className={`mx-2 rounded border-2 ${run.marked ? "border-ink bg-slate-100" : "border-transparent"}`}
        >
          {run.lines.map((line) => (
            <div key={line.index} className="flex whitespace-pre">
              <span className="w-9 shrink-0 select-none pr-3 text-right text-slate-600">{line.index + 1}</span>
              <span>{line.text}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
