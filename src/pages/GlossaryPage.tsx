import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { glossary } from "../lib/catalog";

const categoryLabels: Record<string, string> = {
  all: "全部分類",
  general: "通用",
  network: "網路",
  dba: "資料庫",
  devops: "DevOps"
};

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return glossary
      .filter((entry) => {
        const source = `${entry.term} ${(entry.aliases ?? []).join(" ")} ${entry.explanation}`.toLowerCase();
        return (
          (!keyword || source.includes(keyword)) &&
          (category === "all" || entry.category === category)
        );
      })
      .sort((a, b) => a.term.localeCompare(b.term, "zh-Hant"));
  }, [category, query]);

  return (
    <>
      <PageHeader
        title="名詞字典"
        description="看不懂的名詞都能在這裡查白話解釋；每個課程章節也會自動列出該章出現的名詞。"
      />
      <div className="card mb-4 grid gap-3 p-3 md:grid-cols-2">
        <input
          className="form-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋名詞或說明，例如 Gateway、隔離層級、502"
        />
        <select className="form-input" value={category} onChange={(event) => setCategory(event.target.value)}>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="card divide-y divide-slate-100">
        {filtered.map((entry) => (
          <div key={entry.term} className="p-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-bold text-slate-950">{entry.term}</span>
              {entry.aliases?.map((alias) => (
                <span key={alias} className="text-xs text-slate-400">
                  {alias}
                </span>
              ))}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {categoryLabels[entry.category]}
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{entry.explanation}</p>
          </div>
        ))}
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">找不到符合的名詞，換個關鍵字試試。</div>
        ) : null}
      </div>
    </>
  );
}
