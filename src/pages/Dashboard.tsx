import ProgressBar from "../components/ProgressBar";
import StatusBadge from "../components/StatusBadge";
import {
  courses,
  getCoursesByPath,
  getLabsByPath,
  getPathName,
  getSkillsByPath,
  labs,
  learningPaths,
  skills
} from "../lib/catalog";
import { completionPercent, countByStatus, getStatus, isDone } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

function statCard(label: string, value: number | string, detail: string) {
  return (
    <div className="card p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

export default function Dashboard({ state }: AppPageProps) {
  const completedCourses = countByStatus(
    courses.map((course) => course.id),
    "course",
    state.progress,
    isDone
  );
  const completedLabs = countByStatus(
    labs.map((lab) => lab.id),
    "lab",
    state.progress,
    isDone
  );
  const reviewItems = state.progress.filter((item) => item.status === "review").length;
  const readySkills = countByStatus(
    skills.map((skill) => skill.id),
    "skill",
    state.progress,
    isDone
  );
  const interviewReady = state.progress.filter(
    (item) => item.itemType === "interview" && isDone(item.status)
  ).length;

  const recentNotes = [...state.notes]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4);
  const inProgressCourses = courses
    .filter((course) => getStatus(state.progress, course.id, "course") === "in_progress")
    .slice(0, 4);
  const nextCourse =
    courses.find((course) => !isDone(getStatus(state.progress, course.id, "course"))) ?? courses[0];
  const nextLab = labs.find((lab) => !isDone(getStatus(state.progress, lab.id, "lab"))) ?? labs[0];

  return (
    <>
      <div className="mb-5 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-normal text-slate-950">Dashboard</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          目前學習進度、待複習項目、進行中課程與下一步建議。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCard("已完成課程", completedCourses, `共 ${courses.length} 門課程`)}
        {statCard("已完成 Lab", completedLabs, `共 ${labs.length} 個 Lab`)}
        {statCard("待複習項目", reviewItems, "課程、Lab、能力與面試題")}
        {statCard("已掌握能力", readySkills, `共 ${skills.length} 個能力項目`)}
        {statCard("面試題進度", interviewReady, "已完成或可面試說明")}
      </div>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
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
          const totalPercent = Math.round((coursePercent + labPercent + skillPercent) / 3);

          return (
            <article key={path.id} className="card p-4">
              <div className="flex min-h-24 flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-950">{path.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{path.description}</p>
                </div>
                <div className="mt-4">
                  <ProgressBar value={totalPercent} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="font-bold text-slate-900">{pathCourses.length}</div>
                  <div className="text-slate-500">課程</div>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="font-bold text-slate-900">{pathLabs.length}</div>
                  <div className="text-slate-500">Lab</div>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <div className="font-bold text-slate-900">{pathSkills.length}</div>
                  <div className="text-slate-500">能力</div>
                </div>
              </div>
              <a href={`#/paths/${path.id}`} className="btn-secondary mt-4 w-full">
                進入路線
              </a>
            </article>
          );
        })}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="card p-4">
          <h2 className="text-base font-bold text-slate-950">目前進行中的課程</h2>
          <div className="mt-3 space-y-3">
            {inProgressCourses.length > 0 ? (
              inProgressCourses.map((course) => (
                <a key={course.id} href={`#/courses/${course.id}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <div className="text-sm font-semibold text-slate-900">{course.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{getPathName(course.pathId)}</div>
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-500">尚未標記進行中的課程。</p>
            )}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-base font-bold text-slate-950">下一個建議學習項目</h2>
          <a href={`#/courses/${nextCourse.id}`} className="mt-3 block rounded-md border border-teal-200 bg-teal-50 p-3">
            <div className="text-sm font-bold text-teal-900">{nextCourse.title}</div>
            <div className="mt-1 text-xs text-teal-700">{getPathName(nextCourse.pathId)}</div>
            <div className="mt-3">
              <StatusBadge status={getStatus(state.progress, nextCourse.id, "course")} />
            </div>
          </a>
          <a href={`#/labs/${nextLab.id}`} className="mt-3 block rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="text-sm font-bold text-amber-900">{nextLab.title}</div>
            <div className="mt-1 text-xs text-amber-700">本週 Lab 建議</div>
          </a>
        </div>

        <div className="card p-4">
          <h2 className="text-base font-bold text-slate-950">最近更新的筆記</h2>
          <div className="mt-3 space-y-3">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <a key={note.id} href="#/notes" className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <div className="line-clamp-1 text-sm font-semibold text-slate-900">{note.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {note.category} · {getPathName(note.pathId)}
                  </div>
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-500">尚未建立筆記。</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
