import { useMemo, useState } from "react";
import Filters from "../components/Filters";
import PageHeader from "../components/PageHeader";
import StatusSelect from "../components/StatusSelect";
import { getPathName, jobMappings } from "../lib/catalog";
import { getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

export default function JobsPage({ state, actions }: AppPageProps) {
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return jobMappings.filter((job) => {
      const status = getStatus(state.progress, job.id, "jobMapping");
      const source = `${job.requirement} ${job.learningGoal} ${job.interviewStatement}`.toLowerCase();
      return (
        (!keyword || source.includes(keyword)) &&
        (pathFilter === "all" || job.pathId === pathFilter) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [pathFilter, query, state.progress, statusFilter]);

  return (
    <>
      <PageHeader title="職缺能力對應" description="把職缺要求連回課程、Lab、能力檢核與面試說法。" />
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
                <th className="px-4 py-3">職缺要求</th>
                <th className="px-4 py-3">需要學會的內容</th>
                <th className="px-4 py-3">面試說法</th>
                <th className="px-4 py-3">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((job) => (
                <tr key={job.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-950">{job.requirement}</div>
                    <div className="mt-1 text-xs text-slate-500">{getPathName(job.pathId)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm leading-6 text-slate-600">{job.learningGoal}</td>
                  <td className="px-4 py-3 text-sm leading-6 text-slate-600">{job.interviewStatement}</td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      value={getStatus(state.progress, job.id, "jobMapping")}
                      onChange={(status) => actions.updateProgress(job.id, "jobMapping", status)}
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
