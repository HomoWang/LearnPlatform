import PageHeader from "../components/PageHeader";
import StatusSelect from "../components/StatusSelect";
import { findGlossaryInText, getCourse, getLab, getPathName } from "../lib/catalog";
import { makeId } from "../lib/id";
import { getStatus } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";
import type { PortfolioItem } from "../types";

type LabDetailPageProps = AppPageProps & {
  labId: string;
};

function buildPortfolioItem(labId: string, pathId: string, title: string, template: string, tags: string[]): PortfolioItem {
  const now = new Date().toISOString();
  return {
    id: makeId("portfolio"),
    pathId,
    title: title.replace(/^建立|^完成/, ""),
    relatedLabs: [labId],
    skills: tags,
    description: template,
    tools: tags,
    troubleshooting: "依 Lab 步驟整理問題現象、檢查順序、Log 線索、修正方式與驗證結果。",
    resumeText: `${title}：${template}`,
    interviewText: `我曾完成「${title}」，重點是先拆解需求與環境，再依步驟實作、檢查 Log、記錄問題原因並驗證結果。`,
    createdAt: now,
    updatedAt: now
  };
}

export default function LabDetailPage({ labId, state, actions }: LabDetailPageProps) {
  const lab = getLab(labId);

  if (!lab) {
    return <PageHeader title="找不到 Lab" description="請回到 Lab 列表選擇有效任務。" />;
  }

  const relatedCourse = lab.courseId ? getCourse(lab.courseId) : undefined;
  const hasPortfolio = state.portfolioItems.some((item) => item.relatedLabs.includes(lab.id));
  const glossaryMatches = findGlossaryInText(
    [
      lab.title,
      lab.objective,
      ...lab.prerequisites,
      ...lab.steps,
      ...(lab.stepGuides ?? []),
      ...lab.commonErrors,
      ...lab.troubleshooting
    ].join("\n")
  );

  function handleGeneratePortfolio() {
    if (!lab) {
      return;
    }
    actions.savePortfolioItem(
      buildPortfolioItem(lab.id, lab.pathId, lab.title, lab.portfolioTemplate, lab.tags)
    );
  }

  return (
    <>
      <PageHeader
        title={lab.title}
        description={`${getPathName(lab.pathId)} · ${lab.difficulty}${relatedCourse ? ` · ${relatedCourse.title}` : ""}`}
        actions={
          <>
            <a href="#/labs" className="btn-secondary">Lab 列表</a>
            <button className="btn-primary" onClick={handleGeneratePortfolio} disabled={hasPortfolio}>
              {hasPortfolio ? "已產生作品集" : "產生作品集"}
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <section className="card p-4">
            <h2 className="font-bold text-slate-950">目標</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{lab.objective}</p>
          </section>

          <section className="card p-4">
            <h2 className="font-bold text-slate-950">實作步驟</h2>
            <ol className="mt-3 space-y-2">
              {lab.steps.map((step, index) => (
                <li key={step} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-butter font-hn text-xs text-ink">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                  {lab.stepGuides?.[index] ? (
                    <details className="ml-9 mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-teal-700">
                        怎麼做？（點開看具體指引）
                      </summary>
                      <div className="mt-2 whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 text-sm leading-7 text-slate-700">
                        {lab.stepGuides[index]}
                      </div>
                    </details>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="card p-4">
              <h2 className="font-bold text-slate-950">完成條件</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {lab.completionCriteria.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
            <section className="card p-4">
              <h2 className="font-bold text-slate-950">常見錯誤</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {lab.commonErrors.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          </div>

          <section className="card p-4">
            <h2 className="font-bold text-slate-950">排查流程</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {lab.troubleshooting.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          {glossaryMatches.length > 0 ? (
            <section className="card p-4">
              <details>
                <summary className="cursor-pointer font-bold text-slate-950">
                  本 Lab 名詞解釋（{glossaryMatches.length} 個）
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
            </section>
          ) : null}

          <section className="card p-4">
            <h2 className="font-bold text-slate-950">作品集模板</h2>
            <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {lab.portfolioTemplate}
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h2 className="font-bold text-slate-950">Lab 狀態</h2>
            <div className="mt-3">
              <StatusSelect
                value={getStatus(state.progress, lab.id, "lab")}
                onChange={(status) => actions.updateProgress(lab.id, "lab", status)}
              />
            </div>
          </div>
          <div className="card p-4">
            <h2 className="font-bold text-slate-950">前置條件</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {lab.prerequisites.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="card p-4">
            <h2 className="font-bold text-slate-950">標籤</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {lab.tags.map((tag) => (
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
