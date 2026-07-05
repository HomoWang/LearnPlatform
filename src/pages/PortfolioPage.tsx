import { FormEvent, useMemo, useState } from "react";
import Filters from "../components/Filters";
import PageHeader from "../components/PageHeader";
import { getLab, getPathName, labs, learningPaths } from "../lib/catalog";
import { makeId } from "../lib/id";
import type { AppPageProps } from "../lib/appActions";
import type { PortfolioItem } from "../types";

type PortfolioDraft = {
  id?: string;
  pathId: string;
  title: string;
  relatedLabs: string[];
  skills: string;
  description: string;
  tools: string;
  troubleshooting: string;
  resumeText: string;
  interviewText: string;
  createdAt?: string;
};

function emptyDraft(): PortfolioDraft {
  return {
    pathId: "network",
    title: "",
    relatedLabs: [],
    skills: "",
    description: "",
    tools: "",
    troubleshooting: "",
    resumeText: "",
    interviewText: ""
  };
}

export default function PortfolioPage({ state, actions }: AppPageProps) {
  const [draft, setDraft] = useState<PortfolioDraft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return state.portfolioItems
      .filter((item) => {
        const source = `${item.title} ${item.description} ${item.skills.join(" ")} ${item.tools.join(" ")}`.toLowerCase();
        return (
          (!keyword || source.includes(keyword)) &&
          (pathFilter === "all" || item.pathId === pathFilter)
        );
      })
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [pathFilter, query, state.portfolioItems]);

  function applyLabTemplate(labId: string) {
    const lab = getLab(labId);
    if (!lab) {
      return;
    }

    setDraft({
      ...draft,
      pathId: lab.pathId,
      title: lab.title,
      relatedLabs: [lab.id],
      skills: lab.tags.join(", "),
      tools: lab.tags.join(", "),
      description: lab.portfolioTemplate,
      troubleshooting: lab.troubleshooting.join("\n"),
      resumeText: `${lab.title}：${lab.portfolioTemplate}`,
      interviewText: `我完成「${lab.title}」時，先確認需求與環境，再依步驟實作、檢查 Log、定位錯誤並驗證結果。`
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    const now = new Date().toISOString();
    const item: PortfolioItem = {
      id: draft.id ?? makeId("portfolio"),
      pathId: draft.pathId,
      title: draft.title.trim(),
      relatedLabs: draft.relatedLabs,
      skills: draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      description: draft.description.trim(),
      tools: draft.tools.split(",").map((tool) => tool.trim()).filter(Boolean),
      troubleshooting: draft.troubleshooting.trim(),
      resumeText: draft.resumeText.trim(),
      interviewText: draft.interviewText.trim(),
      createdAt: draft.createdAt ?? now,
      updatedAt: now
    };

    actions.savePortfolioItem(item);
    setDraft(emptyDraft());
  }

  function editItem(item: PortfolioItem) {
    setDraft({
      id: item.id,
      pathId: item.pathId,
      title: item.title,
      relatedLabs: item.relatedLabs,
      skills: item.skills.join(", "),
      description: item.description,
      tools: item.tools.join(", "),
      troubleshooting: item.troubleshooting,
      resumeText: item.resumeText,
      interviewText: item.interviewText,
      createdAt: item.createdAt
    });
  }

  return (
    <>
      <PageHeader title="作品集整理" description="把完成的 Lab 轉成履歷、面試與作品集可使用的描述。" />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <form className="card space-y-3 p-4" onSubmit={handleSubmit}>
          <h2 className="font-bold text-slate-950">{draft.id ? "編輯作品集項目" : "新增作品集項目"}</h2>
          <select className="form-input" onChange={(event) => applyLabTemplate(event.target.value)} value="">
            <option value="">從 Lab 套用模板</option>
            {labs.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.title}
              </option>
            ))}
          </select>
          <select className="form-input" value={draft.pathId} onChange={(event) => setDraft({ ...draft, pathId: event.target.value })}>
            {learningPaths.map((path) => (
              <option key={path.id} value={path.id}>
                {path.title}
              </option>
            ))}
          </select>
          <input className="form-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="作品名稱" />
          <input className="form-input" value={draft.skills} onChange={(event) => setDraft({ ...draft, skills: event.target.value })} placeholder="對應技能，以逗號分隔" />
          <input className="form-input" value={draft.tools} onChange={(event) => setDraft({ ...draft, tools: event.target.value })} placeholder="使用工具，以逗號分隔" />
          <textarea className="form-input min-h-24" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="實作內容" />
          <textarea className="form-input min-h-24" value={draft.troubleshooting} onChange={(event) => setDraft({ ...draft, troubleshooting: event.target.value })} placeholder="解決問題 / 排查流程" />
          <textarea className="form-input min-h-24" value={draft.resumeText} onChange={(event) => setDraft({ ...draft, resumeText: event.target.value })} placeholder="履歷可用說法" />
          <textarea className="form-input min-h-24" value={draft.interviewText} onChange={(event) => setDraft({ ...draft, interviewText: event.target.value })} placeholder="面試可用說法" />
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">儲存</button>
            {draft.id ? <button className="btn-secondary" type="button" onClick={() => setDraft(emptyDraft())}>取消</button> : null}
          </div>
        </form>

        <section>
          <Filters query={query} onQueryChange={setQuery} pathId={pathFilter} onPathChange={setPathFilter} />
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <article key={item.id} className="card p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-xs font-semibold text-teal-700">{getPathName(item.pathId)}</div>
                      <h2 className="mt-1 text-lg font-bold text-slate-950">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-md bg-slate-50 p-3">
                          <div className="text-sm font-semibold text-slate-900">履歷可用說法</div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.resumeText}</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <div className="text-sm font-semibold text-slate-900">面試可用說法</div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.interviewText}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button className="btn-secondary" type="button" onClick={() => editItem(item)}>編輯</button>
                      <button className="btn-secondary" type="button" onClick={() => actions.deletePortfolioItem(item.id)}>刪除</button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="card p-6 text-sm text-slate-500">尚未建立作品集項目。</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
