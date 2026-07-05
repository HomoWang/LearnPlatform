import { useMemo, useState } from "react";
import Filters from "../components/Filters";
import PageHeader from "../components/PageHeader";
import StatusSelect from "../components/StatusSelect";
import { collectTags, courses, getPathName } from "../lib/catalog";
import { getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

export default function CoursesPage({ state, actions }: AppPageProps) {
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const tags = collectTags(courses);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return courses.filter((course) => {
      const status = getStatus(state.progress, course.id, "course");
      const source = `${course.title} ${course.stage} ${course.description} ${course.businessUse} ${course.tags.join(" ")}`.toLowerCase();
      return (
        (!keyword || source.includes(keyword)) &&
        (pathFilter === "all" || course.pathId === pathFilter) &&
        (statusFilter === "all" || status === statusFilter) &&
        (tagFilter === "all" || course.tags.includes(tagFilter))
      );
    });
  }, [pathFilter, query, state.progress, statusFilter, tagFilter]);

  return (
    <>
      <PageHeader title="課程列表" description="所有固定教材章節，可依路線、狀態與標籤篩選。" />
      <Filters
        query={query}
        onQueryChange={setQuery}
        pathId={pathFilter}
        onPathChange={setPathFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        tag={tagFilter}
        tags={tags}
        onTagChange={setTagFilter}
      />
      <div className="grid gap-4">
        {filtered.map((course) => (
          <article key={course.id} className="card p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <div>
                <div className="text-xs font-semibold text-teal-700">{getPathName(course.pathId)} · {course.stage}</div>
                <a href={`#/courses/${course.id}`} className="mt-1 block text-lg font-bold text-slate-950 hover:text-teal-700">
                  {course.title}
                </a>
                <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <StatusSelect
                  value={getStatus(state.progress, course.id, "course")}
                  onChange={(status) => actions.updateProgress(course.id, "course", status)}
                />
                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  {course.lessons.length} 章節
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
