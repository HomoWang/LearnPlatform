import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusSelect from "../components/StatusSelect";
import { getCourse, getLab, getPathName, interviewQuestions } from "../lib/catalog";
import { getStatus, statusLabels, statusOptions } from "../lib/progress";
import type { AppPageProps } from "../lib/appActions";

export default function InterviewPage({ state, actions }: AppPageProps) {
  const [query, setQuery] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return interviewQuestions.filter((question) => {
      const status = getStatus(state.progress, question.id, "interview");
      const source = `${question.question} ${question.referenceAnswer} ${question.tags.join(" ")}`.toLowerCase();
      return (
        (!keyword || source.includes(keyword)) &&
        (pathFilter === "all" || question.pathId === pathFilter) &&
        (statusFilter === "all" || status === statusFilter) &&
        (typeFilter === "all" || question.type === typeFilter)
      );
    });
  }, [pathFilter, query, state.progress, statusFilter, typeFilter]);

  function getAnswer(questionId: string) {
    return state.interviewAnswers.find((answer) => answer.questionId === questionId)?.answer ?? "";
  }

  return (
    <>
      <PageHeader title="面試題庫" description="依路線與題型練習基礎觀念、排查、企業情境與專案經驗題。" />
      <div className="card mb-4 grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-5">
        <input className="form-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋" />
        <select className="form-input" value={pathFilter} onChange={(event) => setPathFilter(event.target.value)}>
          <option value="all">全部路線</option>
          <option value="network">網路工程師</option>
          <option value="dba">DBA</option>
          <option value="devops">DevOps / AI</option>
        </select>
        <select className="form-input" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="all">全部題型</option>
          <option value="basic">基礎觀念題</option>
          <option value="troubleshooting">實務排查題</option>
          <option value="scenario">企業情境題</option>
          <option value="project">專案經驗題</option>
        </select>
        <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">全部狀態</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((question) => (
          <article key={question.id} className="card p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="text-xs font-semibold text-teal-700">
                  {getPathName(question.pathId)} · {question.type}
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-950">{question.question}</h2>
                <div className="mt-3 rounded-md bg-slate-50 p-3">
                  <div className="text-sm font-semibold text-slate-900">參考回答</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{question.referenceAnswer}</p>
                </div>
                {question.relatedCourses?.length || question.relatedLabs?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.relatedCourses?.map((courseId) => (
                      <a
                        key={courseId}
                        href={`#/courses/${courseId}`}
                        className="rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-xs text-teal-800 hover:bg-teal-100"
                      >
                        課程：{getCourse(courseId)?.title ?? courseId}
                      </a>
                    ))}
                    {question.relatedLabs?.map((labId) => (
                      <a
                        key={labId}
                        href={`#/labs/${labId}`}
                        className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800 hover:bg-amber-100"
                      >
                        Lab：{getLab(labId)?.title ?? labId}
                      </a>
                    ))}
                  </div>
                ) : null}
                <textarea
                  className="form-input mt-3 min-h-28"
                  value={getAnswer(question.id)}
                  onChange={(event) =>
                    actions.saveInterviewAnswer({
                      questionId: question.id,
                      answer: event.target.value,
                      updatedAt: new Date().toISOString()
                    })
                  }
                  placeholder="我的回答"
                />
              </div>
              <div className="space-y-3">
                <StatusSelect
                  value={getStatus(state.progress, question.id, "interview")}
                  onChange={(status) => actions.updateProgress(question.id, "interview", status)}
                />
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
