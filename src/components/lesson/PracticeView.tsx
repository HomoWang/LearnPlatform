import type { ReactNode } from "react";
import type { Lesson, PracticeExtra } from "../../types";
import { collectStrings, findGlossaryInText, getFullTeaching, getLessonExplainer } from "../../lib/catalog";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-xl text-ink">{title}</h2>
      {children}
    </section>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="mt-5 text-base font-bold text-ink">{children}</h3>;
}

/** extras 的 body：行首 "> " 是指令、"| " 是輸出，連續幾行排成一塊；其他是一般文字 */
function ExtraBody({ body }: { body: string }) {
  const blocks: { kind: "text" | "code"; lines: string[] }[] = [];
  for (const line of body.split("\n")) {
    const isCode = line.startsWith("> ") || line.startsWith("| ") || line === "|";
    const kind = isCode ? "code" : "text";
    const last = blocks[blocks.length - 1];
    if (last && last.kind === kind && kind === "code") last.lines.push(line);
    else blocks.push({ kind, lines: [line] });
  }
  return (
    <div className="mt-3 space-y-2">
      {blocks.map((block, index) =>
        block.kind === "code" ? (
          <pre
            key={index}
            className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[15px] leading-6 text-ink"
          >
            {block.lines.map((line, i) => (
              <div key={i}>
                {line.startsWith("> ") ? (
                  <>
                    <span className="select-none text-slate-600">$ </span>
                    {line.slice(2)}
                  </>
                ) : (
                  <span className="text-slate-700">{line.slice(2) || " "}</span>
                )}
              </div>
            ))}
          </pre>
        ) : (
          <p key={index} className="text-base leading-7 text-ink">
            {block.lines[0]}
          </p>
        )
      )}
    </div>
  );
}

function Extra({ extra }: { extra: PracticeExtra }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <h3 className="text-lg text-ink">{extra.title}</h3>
      {extra.body ? <ExtraBody body={extra.body} /> : null}
      {extra.table ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-[15px] leading-6">
            <thead>
              <tr>
                {extra.table.columns.map((column) => (
                  <th key={column} scope="col" className="border-b-2 border-slate-300 px-2 py-2 font-bold text-ink">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {extra.table.rows.map((row) => (
                <tr key={row[0]} className="border-b border-slate-200 align-top">
                  {row.map((value, index) =>
                    index === 0 ? (
                      <th
                        key={index}
                        scope="row"
                        className={`px-2 py-2 font-normal text-ink ${
                          /^[ -~]+$/.test(value) ? "whitespace-nowrap font-mono" : "min-w-[9rem]"
                        }`}
                      >
                        {value}
                      </th>
                    ) : (
                      <td key={index} className="px-2 py-2 text-ink">
                        {value}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {extra.note ? <p className="mt-3 text-base leading-7 text-slate-700">{extra.note}</p> : null}
    </section>
  );
}

function List({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const className = `mt-2 space-y-1.5 pl-6 text-base leading-7 text-ink ${ordered ? "list-decimal" : "list-disc"}`;
  const children = items.map((item) => <li key={item}>{item}</li>);
  return ordered ? <ol className={className}>{children}</ol> : <ul className={className}>{children}</ul>;
}

/** 動手做：課文、教學內容（含手把手解答）、速查與延伸說明、常見問題、本課名詞 */
export default function PracticeView({ lesson }: { lesson: Lesson }) {
  const teaching = getFullTeaching(lesson);
  const glossary = findGlossaryInText(
    collectStrings([lesson, teaching, getLessonExplainer(lesson.id)]).join("\n")
  );
  const hasTeaching =
    teaching.teachingSteps?.length ||
    teaching.example ||
    teaching.practiceTasks?.length ||
    teaching.beginnerChecklist?.length ||
    teaching.handson;

  return (
    <div className="space-y-8">
      <Panel title={getLessonExplainer(lesson.id) ? lesson.title : "課文"}>
        <p className="mt-2 text-base font-bold leading-7 text-ink">{lesson.objective}</p>
        <p className="mt-3 text-base leading-7 text-ink">{lesson.content}</p>
      </Panel>

      {hasTeaching ? (
        <Panel title="教學內容">
          {teaching.teachingSteps?.length ? (
            <>
              <SubTitle>學習步驟</SubTitle>
              <List items={teaching.teachingSteps} ordered />
            </>
          ) : null}
          {teaching.example ? (
            <>
              <SubTitle>範例</SubTitle>
              <pre className="mt-2 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[15px] leading-6 text-ink">
                <code>{teaching.example}</code>
              </pre>
            </>
          ) : null}
          {teaching.practiceTasks?.length ? (
            <>
              <SubTitle>練習任務</SubTitle>
              <List items={teaching.practiceTasks} />
            </>
          ) : null}
          {teaching.handson ? (
            <details className="mt-5 rounded-md border border-slate-300 bg-white">
              <summary className="cursor-pointer px-3 py-2 text-base font-bold text-ink">
                手把手解答（建議先自己做，卡住再展開）
              </summary>
              <div className="whitespace-pre-wrap border-t border-slate-200 px-3 py-3 text-base leading-7 text-ink">
                {teaching.handson}
              </div>
            </details>
          ) : null}
          {teaching.beginnerChecklist?.length ? (
            <>
              <SubTitle>小白檢核</SubTitle>
              <List items={teaching.beginnerChecklist} />
            </>
          ) : null}
        </Panel>
      ) : null}

      {teaching.extras?.length ? (
        <div className="space-y-4">
          <h2 className="text-xl text-ink">速查與延伸說明</h2>
          {teaching.extras.map((extra) => (
            <Extra key={extra.title} extra={extra} />
          ))}
        </div>
      ) : null}

      <Panel title="常見問題與排查">
        <SubTitle>常見問題</SubTitle>
        <List items={lesson.commonIssues} />
        <SubTitle>排查方式</SubTitle>
        <List items={lesson.troubleshooting} ordered />
        <SubTitle>面試重點</SubTitle>
        <List items={lesson.interviewPoints} />
      </Panel>

      {glossary.length > 0 ? (
        <details className="rounded-lg border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-base font-bold text-ink sm:px-6">
            本課名詞解釋（{glossary.length} 個，看不懂的名詞先點開這裡）
          </summary>
          <dl className="space-y-3 border-t border-slate-200 px-4 py-4 sm:px-6">
            {glossary.map((entry) => (
              <div key={entry.term} className="text-base leading-7">
                <dt className="font-bold text-ink">{entry.term}</dt>
                <dd className="text-slate-700">{entry.explanation}</dd>
              </div>
            ))}
          </dl>
          <a href="#/glossary" className="block px-4 pb-4 text-[15px] text-slate-700 underline sm:px-6">
            查完整名詞字典 →
          </a>
        </details>
      ) : null}
    </div>
  );
}
