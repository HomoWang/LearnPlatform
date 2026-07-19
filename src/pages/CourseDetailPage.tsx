import PageHeader from "../components/PageHeader";
import StatusSelect from "../components/StatusSelect";
import { findGlossaryInText, getCourse, getLessonTeaching, getPathName } from "../lib/catalog";
import { getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

type CourseDetailPageProps = AppPageProps & {
  courseId: string;
};

export default function CourseDetailPage({ courseId, state, actions }: CourseDetailPageProps) {
  const course = getCourse(courseId);

  if (!course) {
    return <PageHeader title="找不到課程" description="請回到課程列表選擇有效課程。" />;
  }

  return (
    <>
      <PageHeader
        title={course.title}
        description={`${getPathName(course.pathId)} · ${course.stage}`}
        actions={
          <>
            <a href={`#/paths/${course.pathId}`} className="btn-secondary">路線頁</a>
            <a href="#/notes" className="btn-secondary">寫筆記</a>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <section className="card p-4">
            <h2 className="font-bold text-slate-950">課程說明</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{course.description}</p>
            <div className="mt-4 rounded-md bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-900">企業實務用途</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{course.businessUse}</p>
            </div>
          </section>

          {course.lessons.map((lesson, index) => (
            (() => {
              const teaching = {
                ...getLessonTeaching(lesson.id),
                teachingSteps: lesson.teachingSteps ?? getLessonTeaching(lesson.id)?.teachingSteps,
                example: lesson.example ?? getLessonTeaching(lesson.id)?.example,
                practiceTasks: lesson.practiceTasks ?? getLessonTeaching(lesson.id)?.practiceTasks,
                beginnerChecklist:
                  lesson.beginnerChecklist ?? getLessonTeaching(lesson.id)?.beginnerChecklist
              };
              const glossaryMatches = findGlossaryInText(
                [
                  lesson.title,
                  lesson.objective,
                  lesson.content,
                  ...(teaching.teachingSteps ?? []),
                  teaching.example ?? "",
                  ...(teaching.practiceTasks ?? []),
                  ...lesson.commonIssues,
                  ...lesson.troubleshooting,
                  ...lesson.interviewPoints
                ].join("\n")
              );

              return (
                <section key={lesson.id} className="card p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">章節 {index + 1}</div>
                      <h2 className="mt-1 text-lg font-bold text-slate-950">{lesson.title}</h2>
                      <p className="mt-2 text-sm font-semibold text-teal-700">{lesson.objective}</p>
                    </div>
                    <StatusSelect
                      value={getStatus(state.progress, lesson.id, "lesson")}
                      onChange={(status) => actions.updateProgress(lesson.id, "lesson", status)}
                    />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{lesson.content}</p>
                  {glossaryMatches.length > 0 ? (
                    <details className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                      <summary className="cursor-pointer text-sm font-bold text-slate-900">
                        本章名詞解釋（{glossaryMatches.length} 個，看不懂的名詞先點開這裡）
                      </summary>
                      <dl className="mt-3 space-y-3">
                        {glossaryMatches.map((entry) => (
                          <div key={entry.term} className="text-sm leading-6">
                            <dt className="font-semibold text-slate-900">{entry.term}</dt>
                            <dd className="text-slate-600">{entry.explanation}</dd>
                          </div>
                        ))}
                      </dl>
                      <a href="#/glossary" className="mt-3 inline-block text-xs font-semibold text-teal-700 hover:text-teal-900">
                        查完整名詞字典 →
                      </a>
                    </details>
                  ) : null}
                  {teaching.teachingSteps?.length ||
                  teaching.example ||
                  teaching.practiceTasks?.length ||
                  teaching.beginnerChecklist?.length ||
                  teaching.handson ? (
                    <div className="mt-4 rounded-md border border-teal-100 bg-teal-50/60 p-4">
                      <h3 className="text-sm font-bold text-teal-950">教學內容</h3>
                      {teaching.teachingSteps?.length ? (
                        <div className="mt-3">
                          <div className="text-sm font-semibold text-slate-900">學習步驟</div>
                          <ol className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                            {teaching.teachingSteps.map((step, stepIndex) => (
                              <li key={step} className="flex gap-2">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-butter font-hn text-xs text-ink">
                                  {stepIndex + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                      {teaching.example ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-slate-900">範例</div>
                          <pre className="mt-2 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-6 text-slate-100">
                            <code>{teaching.example}</code>
                          </pre>
                        </div>
                      ) : null}
                      {teaching.practiceTasks?.length ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-slate-900">練習任務</div>
                          <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                            {teaching.practiceTasks.map((task) => (
                              <li key={task}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {teaching.handson ? (
                        <details className="mt-4 rounded-md border border-teal-300 bg-white p-3">
                          <summary className="cursor-pointer text-sm font-bold text-teal-900">
                            手把手解答（建議先自己做，卡住再展開）
                          </summary>
                          <div className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-7 text-slate-700">
                            {teaching.handson}
                          </div>
                        </details>
                      ) : null}
                      {teaching.beginnerChecklist?.length ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-slate-900">小白檢核</div>
                          <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                            {teaching.beginnerChecklist.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md bg-slate-50 p-3">
                      <h3 className="text-sm font-bold text-slate-900">常見問題</h3>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {lesson.commonIssues.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <h3 className="text-sm font-bold text-slate-900">排查方式</h3>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {lesson.troubleshooting.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <h3 className="text-sm font-bold text-slate-900">面試重點</h3>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {lesson.interviewPoints.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              );
            })()
          ))}
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h2 className="font-bold text-slate-950">課程狀態</h2>
            <div className="mt-3">
              <StatusSelect
                value={getStatus(state.progress, course.id, "course")}
                onChange={(status) => actions.updateProgress(course.id, "course", status)}
              />
            </div>
          </div>
          <div className="card p-4">
            <h2 className="font-bold text-slate-950">標籤</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
