import { useEffect, useRef, useState } from "react";
import type { LessonExplainer } from "../../types";
import Stage from "./Stage";
import { Inline, optionButton, primaryLink, secondaryLink, useReducedMotion } from "./shared";

type Props = {
  explainer: LessonExplainer;
  nextHref: string;
  nextLabel: string;
  practiceHref: string;
};

const LETTERS = ["A", "B", "C", "D"];

function Quiz({ quiz }: { quiz: LessonExplainer["quiz"] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const option = picked === null ? null : quiz.options[picked];
  return (
    <>
      <p className="mt-3 text-base leading-7 text-ink">
        <Inline text={quiz.question} />
      </p>
      <div className="mt-4 flex flex-col gap-2" role="group" aria-label="選一個答案">
        {quiz.options.map((item, index) => (
          <button
            key={item.text}
            type="button"
            aria-pressed={picked === index}
            onClick={() => setPicked(index)}
            className={`${optionButton(picked === index)} text-left`}
          >
            <span className="mr-2 font-mono">{LETTERS[index]}.</span>
            {item.text}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {option ? (
          <p
            className={`mt-4 rounded-md border px-3 py-2 text-base leading-7 text-ink ${
              option.correct ? "border-dba-deep bg-dba-tint" : "border-dev-deep bg-dev-tint"
            }`}
          >
            <span className={`mr-1 font-bold ${option.correct ? "text-dba-deep" : "text-dev-deep"}`} aria-hidden="true">
              {option.correct ? "✓" : "✕"}
            </span>
            <span className="mr-2 font-bold">{option.correct ? "正確" : "再想想"}</span>
            {option.explanation}
          </p>
        ) : null}
      </div>
    </>
  );
}

export default function ExplainerView({ explainer, nextHref, nextLabel, practiceHref }: Props) {
  const reduced = useReducedMotion();
  const items = [
    ...explainer.cards.map((card, index) => ({ id: `card-${card.id}`, label: String(index + 1), title: card.title })),
    { id: "recap", label: "回顧", title: "重點回顧" },
    { id: "quiz", label: "檢測", title: "隨堂檢測" }
  ];
  const [current, setCurrent] = useState(0);
  const lock = useRef(0);

  // 目前所在的那一格：最後一個頂端已經捲過進度列下方的區塊
  useEffect(() => {
    const update = () => {
      if (Date.now() < lock.current) return;
      const offset = 140;
      let active = 0;
      items.forEach((item, index) => {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= offset) active = index;
      });
      // 捲到底時最後幾區的頂端到不了進度列下方，直接算在最後一格
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
        active = items.length - 1;
      setCurrent(active);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // items 只由 explainer 決定
  }, [explainer]);

  const jump = (index: number) => {
    setCurrent(index);
    lock.current = Date.now() + (reduced ? 50 : 700);
    document.getElementById(items[index].id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <nav
        aria-label="講解進度"
        className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-paper px-4 py-2 sm:-mx-0 sm:px-0"
      >
        <ol className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => jump(index)}
                aria-current={current === index ? "step" : undefined}
                aria-label={`${item.label}：${item.title}`}
                className={`min-w-[2.5rem] rounded-md border-2 px-2.5 py-1 text-[15px] text-ink ${
                  current === index ? "border-ink bg-butter" : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8 space-y-10">
        {explainer.cards.map((card, index) => (
          <section
            key={card.id}
            id={`card-${card.id}`}
            className="scroll-mt-20 rounded-lg border border-slate-200 bg-white p-4 sm:p-6"
          >
            <div className="text-[15px] text-slate-600">{index + 1}</div>
            <h3 className="mt-1 text-xl leading-8 text-ink">{card.title}</h3>
            <p className="mt-3 text-base leading-7 text-ink">
              <Inline text={card.text} />
            </p>
            <Stage stage={card.stage} />
            {card.bridge ? <p className="mt-5 text-base leading-7 text-slate-700">{card.bridge}</p> : null}
          </section>
        ))}

        <section id="recap" className="scroll-mt-20 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="text-xl text-ink">重點回顧</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-base leading-7 text-ink">
            {explainer.recap.map((point) => (
              <li key={point}>
                <Inline text={point} />
              </li>
            ))}
          </ol>
        </section>

        <section id="quiz" className="scroll-mt-20 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="text-xl text-ink">隨堂檢測</h3>
          <Quiz quiz={explainer.quiz} />
        </section>

        <div className="flex flex-wrap gap-3 pb-6">
          <a href={nextHref} className={primaryLink}>
            {nextLabel}
          </a>
          <a href={practiceHref} className={secondaryLink}>
            去動手做
          </a>
        </div>
      </div>
    </>
  );
}
