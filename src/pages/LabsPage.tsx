import { useMemo, useState } from "react";
import Filters from "../components/Filters";
import PageHeader from "../components/PageHeader";
import StatusSelect from "../components/StatusSelect";
import { collectTags, getCourse, getPathName, labs } from "../lib/catalog";
import { getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

export default function LabsPage({ state, actions }: AppPageProps) {
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const tags = collectTags(labs);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return labs.filter((lab) => {
      const status = getStatus(state.progress, lab.id, "lab");
      const source = `${lab.title} ${lab.objective} ${lab.tags.join(" ")}`.toLowerCase();
      return (
        (!keyword || source.includes(keyword)) &&
        (pathFilter === "all" || lab.pathId === pathFilter) &&
        (statusFilter === "all" || status === statusFilter) &&
        (difficultyFilter === "all" || lab.difficulty === difficultyFilter) &&
        (tagFilter === "all" || lab.tags.includes(tagFilter))
      );
    });
  }, [difficultyFilter, pathFilter, query, state.progress, statusFilter, tagFilter]);

  return (
    <>
      <PageHeader title="Lab 實作任務" description="每個 Lab 都可以切換狀態、查看步驟、記錄排查並產生作品集描述。" />
      <Filters
        query={query}
        onQueryChange={setQuery}
        pathId={pathFilter}
        onPathChange={setPathFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        difficulty={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        tag={tagFilter}
        tags={tags}
        onTagChange={setTagFilter}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((lab) => (
          <article key={lab.id} className="card flex flex-col p-4">
            <div className="flex-1">
              <div className="text-xs font-semibold text-teal-700">{getPathName(lab.pathId)} · {lab.difficulty}</div>
              <a href={`#/labs/${lab.id}`} className="mt-1 block text-lg font-bold text-slate-950 hover:text-teal-700">
                {lab.title}
              </a>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lab.objective}</p>
              {lab.courseId ? (
                <div className="mt-3 text-xs text-slate-500">關聯課程：{getCourse(lab.courseId)?.title ?? lab.courseId}</div>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {lab.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <StatusSelect
                value={getStatus(state.progress, lab.id, "lab")}
                onChange={(status) => actions.updateProgress(lab.id, "lab", status)}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
