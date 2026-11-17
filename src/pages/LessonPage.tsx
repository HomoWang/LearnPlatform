import ExplainerView from "../components/lesson/ExplainerView";
import PracticeView from "../components/lesson/PracticeView";
import { Inline } from "../components/lesson/shared";
import { getCourse, getLessonExplainer } from "../lib/catalog";

type LessonPageProps = {
  courseId: string;
  lessonId: string;
  tab: "explain" | "practice";
};

/** 一課一頁：有互動講解的課有「講解」「動手做」兩個分頁；沒有的只顯示動手做的內容 */
export default function LessonPage({ courseId, lessonId, tab }: LessonPageProps) {
  const course = getCourse(courseId);
  const index = course?.lessons.findIndex((lesson) => lesson.id === lessonId) ?? -1;

  if (!course || index < 0) {
    return (
      <div className="lesson-quiet mx-auto max-w-[720px]">
        <h1 className="font-hn text-2xl text-ink">找不到這一課</h1>
        <p className="mt-2 text-base text-slate-700">
          <a href={course ? `#/courses/${course.id}` : "#/courses"} className="underline">
            回到{course ? "課程頁" : "課程列表"}
          </a>
        </p>
      </div>
    );
  }

  const lesson = course.lessons[index];
  const explainer = getLessonExplainer(lesson.id);
  const base = `#/courses/${course.id}/${lesson.id}`;
  const next = course.lessons[index + 1];
  const showExplain = Boolean(explainer) && tab === "explain";

  const tabClass = (active: boolean) =>
    `-mb-px border-b-2 px-1 pb-2 text-base ${active ? "border-ink font-bold text-ink" : "border-transparent text-slate-700 hover:text-ink"}`;

  return (
    <div className="lesson-quiet mx-auto max-w-[720px]">
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[15px]">
          <a href={`#/courses/${course.id}`} className="text-slate-700 hover:text-ink hover:underline">
            ‹ {course.title}
          </a>
          <span className="text-slate-600">
            第 {index + 1} 課／共 {course.lessons.length} 課
          </span>
        </div>
        <h1 className="mt-4 font-hn text-[26px] leading-snug text-ink sm:text-[28px]">
          {explainer ? explainer.question : lesson.title}
        </h1>
        {explainer ? (
          <>
            <p className="mt-3 text-base leading-7 text-ink">
              看完你能：<Inline text={explainer.outcome} />
            </p>
            {explainer.note ? <p className="mt-1 text-base leading-7 text-slate-700">{explainer.note}</p> : null}
          </>
        ) : null}
      </header>

      {explainer ? (
        <nav aria-label="分頁" className="mt-6 flex gap-6 border-b border-slate-300">
          <a href={base} aria-current={showExplain ? "page" : undefined} className={tabClass(showExplain)}>
            講解
          </a>
          <a href={`${base}/practice`} aria-current={!showExplain ? "page" : undefined} className={tabClass(!showExplain)}>
            動手做
          </a>
        </nav>
      ) : null}

      <div className={explainer ? "mt-4" : "mt-6"}>
        {showExplain && explainer ? (
          <ExplainerView
            key={lesson.id}
            explainer={explainer}
            nextHref={next ? `#/courses/${course.id}/${next.id}` : `#/courses/${course.id}`}
            nextLabel={next ? "下一課 ›" : "回到課程頁"}
            practiceHref={`${base}/practice`}
          />
        ) : (
          <>
            <PracticeView lesson={lesson} />
            <div className="mt-8 flex flex-wrap gap-3 pb-6 text-base">
              {next ? (
                <a href={`#/courses/${course.id}/${next.id}`} className="text-ink underline underline-offset-4">
                  下一課 ›
                </a>
              ) : null}
              <a href={`#/courses/${course.id}`} className="text-slate-700 underline underline-offset-4">
                回到課程頁
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
