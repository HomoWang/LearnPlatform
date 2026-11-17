import { getCourse, getLessonExplainer, getLessonMinutes, getPathName } from "../lib/catalog";

type CourseDetailPageProps = {
  courseId: string;
};

/** 課程頁：課程說明＋這門課有哪幾課（每課一張卡，點進去才是內容） */
export default function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const course = getCourse(courseId);

  if (!course) {
    return (
      <div className="lesson-quiet mx-auto max-w-[720px]">
        <h1 className="font-hn text-2xl text-ink">找不到課程</h1>
        <p className="mt-2 text-base text-slate-700">
          <a href="#/courses" className="underline">
            回到課程列表
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="lesson-quiet mx-auto max-w-[720px]">
      <a href={`#/paths/${course.pathId}`} className="text-[15px] text-slate-700 hover:text-ink hover:underline">
        ‹ {getPathName(course.pathId)}
      </a>
      <h1 className="mt-4 font-hn text-[26px] leading-snug text-ink sm:text-[28px]">{course.title}</h1>
      <p className="mt-1 text-[15px] text-slate-600">{course.stage}</p>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-xl text-ink">課程說明</h2>
        <p className="mt-3 text-base leading-7 text-ink">{course.description}</p>
        <h3 className="mt-5 text-base font-bold text-ink">企業實務用途</h3>
        <p className="mt-1 text-base leading-7 text-ink">{course.businessUse}</p>
      </section>

      <h2 className="mt-10 text-xl text-ink">這門課有 {course.lessons.length} 課</h2>
      <ol className="mt-4 space-y-3">
        {course.lessons.map((lesson, index) => {
          const explainer = getLessonExplainer(lesson.id);
          return (
            <li key={lesson.id}>
              <a
                href={`#/courses/${course.id}/${lesson.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-500 sm:px-6"
              >
                <div className="flex items-baseline justify-between gap-4 text-[15px] text-slate-600">
                  <span>第 {index + 1} 課</span>
                  <span>約 {getLessonMinutes(lesson)} 分鐘</span>
                </div>
                <div className="mt-1 font-hn text-lg leading-7 text-ink">{explainer ? explainer.question : lesson.title}</div>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
