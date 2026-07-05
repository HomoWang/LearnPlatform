import { useMemo, useState } from "react";
import Filters from "../components/Filters";
import PageHeader from "../components/PageHeader";
import StatusSelect from "../components/StatusSelect";
import { getPathName, skills } from "../lib/catalog";
import { getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

export default function SkillsPage({ state, actions }: AppPageProps) {
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const status = getStatus(state.progress, skill.id, "skill");
      const source = `${skill.title} ${skill.description} ${skill.level}`.toLowerCase();
      return (
        (!keyword || source.includes(keyword)) &&
        (pathFilter === "all" || skill.pathId === pathFilter) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [pathFilter, query, state.progress, statusFilter]);

  return (
    <>
      <PageHeader title="能力檢核表" description="依三條路線追蹤每個能力項目的掌握狀態。" />
      <Filters
        query={query}
        onQueryChange={setQuery}
        pathId={pathFilter}
        onPathChange={setPathFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">能力項目</th>
                <th className="px-4 py-3">路線</th>
                <th className="px-4 py-3">程度</th>
                <th className="px-4 py-3">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((skill) => (
                <tr key={skill.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-950">{skill.title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{skill.description}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{getPathName(skill.pathId)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{skill.level}</td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      value={getStatus(state.progress, skill.id, "skill")}
                      onChange={(status) => actions.updateProgress(skill.id, "skill", status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
