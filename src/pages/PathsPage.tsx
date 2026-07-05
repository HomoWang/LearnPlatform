import { useMemo, useState } from "react";
import Filters from "../components/Filters";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import StatusSelect from "../components/StatusSelect";
import {
  courses,
  getCoursesByPath,
  getLabsByPath,
  getSkillsByPath,
  learningPaths
} from "../lib/catalog";
import { completionPercent, getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

export default function PathsPage({ state, actions }: AppPageProps) {
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCourses = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return courses.filter((course) => {
      const status = getStatus(state.progress, course.id, "course");
      const matchesQuery =
        !keyword ||
        `${course.title} ${course.description} ${course.tags.join(" ")}`
          .toLowerCase()
          .includes(keyword);
      const matchesPath = pathFilter === "all" || course.pathId === pathFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesQuery && matchesPath && matchesStatus;
    });
  }, [pathFilter, query, state.progress, statusFilter]);

  return (
    <>
      <PageHeader
        title="學習路線總覽"
        description="三條企業 IT 實務路線的課程、Lab 與能力檢核進度。"
      />

      <div className="page-grid">
        {learningPaths.map((path) => {
          const pathCourses = getCoursesByPath(path.id);
          const pathLabs = getLabsByPath(path.id);
          const pathSkills = getSkillsByPath(path.id);
          const coursePercent = completionPercent(
            pathCourses.map((course) => course.id),
            "course",
            state.progress
          );
          const labPercent = completionPercent(
            pathLabs.map((lab) => lab.id),
            "lab",
            state.progress
          );
          const skillPercent = completionPercent(
            pathSkills.map((skill) => skill.id),
            "skill",
            state.progress
          );

          return (
            <article key={path.id} className="card p-4">
              <h2 className="text-lg font-bold text-slate-950">{path.title}</h2>
              <p className="mt-2 min-h-20 text-sm leading-6 text-slate-600">{path.description}</p>
              <div className="mt-4 space-y-3">
                <ProgressBar value={coursePercent} label="課程完成度" />
                <ProgressBar value={labPercent} label="Lab 完成度" />
                <ProgressBar value={skillPercent} label="能力完成度" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-2 py-1">{pathCourses.length} 課程</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">{pathLabs.length} Lab</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">{pathSkills.length} 能力</span>
              </div>
              <a href={`#/paths/${path.id}`} className="btn-primary mt-4 w-full">
                查看路線
              </a>
            </article>
          );
        })}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-slate-950">課程總表</h2>
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
                  <th className="px-4 py-3">課程</th>
                  <th className="px-4 py-3">階段</th>
                  <th className="px-4 py-3">章節</th>
                  <th className="px-4 py-3">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="align-top">
                    <td className="px-4 py-3">
                      <a href={`#/courses/${course.id}`} className="font-semibold text-teal-700 hover:text-teal-900">
                        {course.title}
                      </a>
                      <div className="mt-1 text-xs text-slate-500">{course.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{course.stage}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{course.lessons.length}</td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        value={getStatus(state.progress, course.id, "course")}
                        onChange={(status) => actions.updateProgress(course.id, "course", status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
