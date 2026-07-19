import Mascot from "../components/Mascot";
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

const pathStyles: Record<string, { spine: string; fill: string; tag: string; tint: string; cover: string }> = {
  network: { spine: "bg-net", fill: "bg-net", tag: "bg-net-tint", tint: "bg-net-tint", cover: "cover-network.png" },
  dba: { spine: "bg-dba", fill: "bg-dba", tag: "bg-dba-tint", tint: "bg-dba-tint", cover: "cover-dba.png" },
  devops: { spine: "bg-dev", fill: "bg-dev", tag: "bg-dev-tint", tint: "bg-dev-tint", cover: "cover-devops.png" }
};

function greetingText() {
  const hour = new Date().getHours();
  if (hour < 5) return "夜深了，記得休息";
  if (hour < 11) return "早安 ☀️ 今天也來學一點吧";
  if (hour < 18) return "午安 ☀️ 今天也來學一點吧";
  return "晚安 🌙 睡前學一小段也很好";
}

function todayText() {
  const now = new Date();
  const week = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 週${week}`;
}

function Stamp({ value, label, done }: { value: number; label: string; done: boolean }) {
  return (
    <div
      className={`flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full border-[2.5px] odd:-rotate-3 even:rotate-2 ${
        done ? "border-solid border-teal-700 bg-teal-50" : "border-dashed border-slate-300 bg-card/75"
      }`}
    >
      <b className={`font-hn text-2xl font-normal ${done ? "text-teal-700" : "text-ink"}`}>{value}</b>
      <span className="mt-0.5 text-[11.5px] text-slate-500">{label}</span>
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] text-ink">嗨，{greetingText()}</h1>
          <p className="mt-1.5 text-sm text-slate-500">慢慢來，比較快。卡住的時候，每一章都有手把手解答陪你。</p>
        </div>
        <div className="rotate-2 bg-butter/55 px-4 py-1.5 font-hn text-[12.5px] [mask-image:linear-gradient(90deg,transparent_0,#000_6px,#000_calc(100%-6px),transparent)]">
          {todayText()}
        </div>
      </div>

      {/* 今天從這裡繼續 */}
      <div className="card relative mt-6 flex flex-wrap items-center gap-6 p-6">
        <div className="absolute -top-3 left-9 h-[26px] w-[110px] -rotate-3 bg-butter/70 shadow-[0_1px_2px_rgba(69,58,47,.12)]" />
        <div className="min-w-0">
          <div className="font-hn text-xs tracking-[0.2em] text-teal-700">今天從這裡繼續</div>
          <h2 className="mt-1.5 text-[22px] text-ink">
            <a href={`#/courses/${nextCourse.id}`} className="hover:underline">
              {nextCourse.title}
            </a>
          </h2>
          <div className="mt-1.5 text-[13px] text-slate-500">{getPathName(nextCourse.pathId)}</div>
          <div className="mt-3">
            <StatusBadge status={getStatus(state.progress, nextCourse.id, "course")} />
          </div>
          <a
            href={`#/labs/${nextLab.id}`}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-dev bg-dev-tint px-3.5 py-1.5 text-[13px] text-dev-deep hover:border-solid"
          >
            🔧 本週 Lab 建議：{nextLab.title}
          </a>
        </div>
        <div className="ml-auto flex flex-col items-center">
          <Mascot variant={new Date().getHours() >= 22 || new Date().getHours() < 5 ? "sleep" : "happy"} width={126} />
          <a href={`#/courses/${nextCourse.id}`} className="btn-primary mt-1 px-6">
            ▶ 繼續學習
          </a>
        </div>
      </div>

      {/* 集點章 */}
      <div className="mt-6 flex flex-wrap gap-4">
        <Stamp value={completedCourses} label="已完成課程" done={completedCourses > 0} />
        <Stamp value={completedLabs} label="已完成 Lab" done={completedLabs > 0} />
        <Stamp value={reviewItems} label="待複習" done={false} />
        <Stamp value={readySkills} label="已掌握能力" done={readySkills > 0} />
        <Stamp value={interviewReady} label="面試題 OK" done={interviewReady > 0} />
      </div>

      {/* 三本學習筆記本 */}
      <h2 className="section-title mt-8">📚 三本學習筆記本</h2>
      <section className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
          const style = pathStyles[path.id] ?? pathStyles.network;

          return (
            <article key={path.id} className="card flex overflow-hidden p-0">
              <div className={`relative w-4 flex-shrink-0 border-r-2 border-ink ${style.spine}`}>
                <i className="absolute left-[5px] top-5 h-1.5 w-1.5 rounded-full bg-white/75" />
                <i className="absolute bottom-5 left-[5px] h-1.5 w-1.5 rounded-full bg-white/75" />
              </div>
              <div className="flex-1 p-5">
                <div className={`flex h-[118px] items-center justify-center rounded-xl border-[1.5px] border-slate-200 ${style.tint}`}>
                  <img
                    src={`${import.meta.env.BASE_URL}art/${style.cover}`}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="h-[104px] w-auto select-none"
                  />
                </div>
                <h3 className="mt-3.5 text-base text-ink">{path.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{path.description}</p>
                <div className="mt-4">
                  <ProgressBar value={totalPercent} fillClass={style.fill} />
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full border-[1.5px] border-slate-200 bg-white px-2.5 py-0.5 text-[11.5px] text-slate-500">
                    {pathCourses.length} 門課
                  </span>
                  <span className="rounded-full border-[1.5px] border-slate-200 bg-white px-2.5 py-0.5 text-[11.5px] text-slate-500">
                    {pathLabs.length} 個 Lab
                  </span>
                  <span className="rounded-full border-[1.5px] border-slate-200 bg-white px-2.5 py-0.5 text-[11.5px] text-slate-500">
                    {pathSkills.length} 能力
                  </span>
                </div>
                <a href={`#/paths/${path.id}`} className="btn-secondary mt-4 w-full">
                  打開這本 →
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {/* 桌上的東西 */}
      <h2 className="section-title mt-8">🗂 桌上的東西</h2>
      <section className="mt-4 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-base text-ink">進行中的課程</h3>
          <div className="mt-3 space-y-2.5">
            {inProgressCourses.length > 0 ? (
              inProgressCourses.map((course) => {
                const style = pathStyles[course.pathId] ?? pathStyles.network;
                return (
                  <a
                    key={course.id}
                    href={`#/courses/${course.id}`}
                    className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white p-3 transition hover:border-ink"
                  >
                    <span className={`sticker-tag flex-shrink-0 ${style.tag}`}>{getPathName(course.pathId).slice(0, 4)}</span>
                    <span className="min-w-0">
                      <b className="block truncate text-[13.5px] font-medium text-ink">{course.title}</b>
                    </span>
                  </a>
                );
              })
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <Mascot variant="curious" width={90} />
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                  還沒有進行中的課程。
                  <br />
                  從上面那張便利貼開始就可以囉！
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-base text-ink">最近的筆記</h3>
          <div className="mt-3 space-y-2.5">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <a
                  key={note.id}
                  href="#/notes"
                  className="block rounded-xl border-[1.5px] border-slate-200 bg-white p-3 transition hover:border-ink"
                >
                  <div className="line-clamp-1 text-[13.5px] font-medium text-ink">{note.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-slate-500">
                    {note.category} · {getPathName(note.pathId)}
                  </div>
                </a>
              ))
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <img
                  src={`${import.meta.env.BASE_URL}art/empty-desk.png`}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="w-[210px] select-none"
                />
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                  這裡還空空的。
                  <br />
                  學到什麼，就先幫未來的自己記一筆吧！
                </p>
                <a href="#/notes" className="btn-primary mt-3 px-5 text-[13.5px]">
                  ＋ 寫第一則筆記
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
