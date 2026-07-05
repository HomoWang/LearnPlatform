import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import StatusSelect from "../components/StatusSelect";
import {
  getCoursesByPath,
  getInterviewByPath,
  getJobsByPath,
  getLabsByPath,
  getPath,
  getSkillsByPath
} from "../lib/catalog";
import { completionPercent, getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

type PathDetailPageProps = AppPageProps & {
  pathId: string;
};

export default function PathDetailPage({ pathId, state, actions }: PathDetailPageProps) {
  const path = getPath(pathId);

  if (!path) {
    return (
      <PageHeader title="找不到學習路線" description="請回到學習路線總覽選擇有效路線。" />
    );
  }

  const pathCourses = getCoursesByPath(path.id);
  const pathLabs = getLabsByPath(path.id);
  const pathSkills = getSkillsByPath(path.id);
  const pathInterviews = getInterviewByPath(path.id);
  const pathJobs = getJobsByPath(path.id);
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
    <>
      <PageHeader
        title={path.title}
        description={path.description}
        actions={<a href="#/paths" className="btn-secondary">返回總覽</a>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4">
          <ProgressBar value={coursePercent} label="課程完成度" />
        </div>
        <div className="card p-4">
          <ProgressBar value={labPercent} label="Lab 完成度" />
        </div>
        <div className="card p-4">
          <ProgressBar value={skillPercent} label="能力完成度" />
        </div>
      </div>

      <section className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="card p-4">
          <h2 className="text-base font-bold text-slate-950">路線階段</h2>
          <ol className="mt-3 space-y-2">
            {path.stages.map((stage, index) => (
              <li key={stage} className="flex gap-2 rounded-md bg-slate-50 p-2 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-slate-700">{stage}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className="space-y-4">
          <section className="card overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-bold text-slate-950">課程章節</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {pathCourses.map((course) => (
                <div key={course.id} className="grid gap-3 p-4 md:grid-cols-[1fr_180px] md:items-center">
                  <div>
                    <a href={`#/courses/${course.id}`} className="font-semibold text-teal-700 hover:text-teal-900">
                      {course.title}
                    </a>
                    <div className="mt-1 text-sm text-slate-500">{course.stage} · {course.lessons.length} 章節</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
                  </div>
                  <StatusSelect
                    value={getStatus(state.progress, course.id, "course")}
                    onChange={(status) => actions.updateProgress(course.id, "course", status)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="card p-4">
              <h2 className="font-bold text-slate-950">Lab 實作</h2>
              <div className="mt-3 space-y-3">
                {pathLabs.slice(0, 5).map((lab) => (
                  <a key={lab.id} href={`#/labs/${lab.id}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                    <div className="font-semibold text-slate-900">{lab.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{lab.difficulty}</div>
                  </a>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <h2 className="font-bold text-slate-950">路線素材</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="text-slate-500">能力項目</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">{pathSkills.length}</dd>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="text-slate-500">面試題</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">{pathInterviews.length}</dd>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="text-slate-500">職缺對應</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">{pathJobs.length}</dd>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="text-slate-500">Lab</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">{pathLabs.length}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
