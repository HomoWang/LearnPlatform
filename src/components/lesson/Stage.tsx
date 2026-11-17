import { useMemo, useState, type ReactNode } from "react";
import type {
  ExplainerControls,
  ExplainerFrame,
  ExplainerStage,
  FileView,
  GatesView,
  GraphView,
  ProdView,
  TrayView
} from "../../types";
import FileScene from "./FileScene";
import GatesScene from "./GatesScene";
import GraphScene, { graphSize } from "./GraphScene";
import ProdScene from "./ProdScene";
import TrayStage from "./TrayStage";
import { actionButton, isCommand, optionButton, useReducedMotion } from "./shared";

type Frame = ExplainerFrame<unknown>;
type Controls = ExplainerControls<unknown>;

type StageState = {
  frame: Frame;
  /** sequence／either：按過的按鈕 */
  pressed: number[];
  /** stepper：已經走到第幾格（-1＝還沒按） */
  step: number;
  /** choice／choiceAction：選中的選項 */
  selected: number | null;
  /** choiceAction：動作鈕按過了 */
  acted: boolean;
  dirty: boolean;
};

function initialState(stage: ExplainerStage): StageState {
  const controls = stage.controls as Controls;
  const selected =
    controls.kind === "choice" ? (controls.selected ?? null) : controls.kind === "choiceAction" ? controls.selected : null;
  return { frame: stage.initial as Frame, pressed: [], step: -1, selected, acted: false, dirty: false };
}

/** 所有可能出現的畫面（Git 歷史圖用來算固定的畫布大小） */
function allFrames(stage: ExplainerStage): Frame[] {
  const controls = stage.controls as Controls;
  const frames: Frame[] = [stage.initial as Frame];
  if (controls.kind === "sequence" || controls.kind === "either") frames.push(...controls.buttons.map((b) => b.result));
  if (controls.kind === "stepper") frames.push(...controls.steps);
  if (controls.kind === "choice") frames.push(...controls.options.map((o) => o.result));
  if (controls.kind === "choiceAction") frames.push(...controls.action.results);
  return frames;
}

function Scene({ stage, frame, animate }: { stage: ExplainerStage; frame: Frame; animate: boolean }) {
  const size = useMemo(
    () => (stage.scene === "graph" ? graphSize(stage.layout, allFrames(stage).map((f) => f.view as GraphView)) : null),
    [stage]
  );
  switch (stage.scene) {
    case "graph":
      return <GraphScene layout={stage.layout} view={frame.view as GraphView} size={size!} animate={animate} />;
    case "file":
      return <FileScene view={frame.view as FileView} />;
    case "trays":
      return <TrayStage view={frame.view as TrayView} animate={animate} />;
    case "gates":
      return <GatesScene gates={stage.gates} view={frame.view as GatesView} />;
    case "prod":
      return <ProdScene view={frame.view as ProdView} />;
  }
}

/** 舞台三層：控制列（＋右上角「↺ 重來」）、畫面、說明列 */
export default function Stage({ stage }: { stage: ExplainerStage }) {
  const [state, setState] = useState(() => initialState(stage));
  const [animate, setAnimate] = useState(false);
  const reduced = useReducedMotion();
  const controls = stage.controls as Controls;

  const go = (next: Partial<StageState>) => {
    setAnimate(!reduced);
    setState((previous) => ({ ...previous, ...next, dirty: true }));
  };

  const reset = () => {
    setAnimate(false);
    setState(initialState(stage));
  };

  let controlRow: ReactNode = null;
  if (controls.kind === "sequence" || controls.kind === "either") {
    controlRow = controls.buttons.map((button, index) => {
      const enabled =
        controls.kind === "either"
          ? state.pressed.length === 0
          : !state.pressed.includes(index) && (index === 0 || state.pressed.includes(index - 1));
      return (
        <button
          key={button.label}
          type="button"
          className={`${actionButton} ${isCommand(button.label) ? "font-mono" : ""}`}
          disabled={!enabled}
          onClick={() => go({ frame: button.result, pressed: [...state.pressed, index] })}
        >
          {button.label}
        </button>
      );
    });
  } else if (controls.kind === "stepper") {
    controlRow = (
      <button
        type="button"
        className={actionButton}
        disabled={state.step >= controls.steps.length - 1}
        onClick={() => go({ frame: controls.steps[state.step + 1], step: state.step + 1 })}
      >
        {controls.label}
      </button>
    );
  } else if (controls.kind === "choice") {
    controlRow = controls.options.map((option, index) => (
      <button
        key={option.label}
        type="button"
        aria-pressed={state.selected === index}
        className={optionButton(state.selected === index)}
        onClick={() => {
          if (state.selected !== index) go({ frame: option.result, selected: index });
        }}
      >
        {option.label}
      </button>
    ));
  } else {
    controlRow = (
      <>
        {controls.options.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={state.selected === index}
            className={optionButton(state.selected === index)}
            onClick={() => {
              // 切換選項：回到初始的錯誤狀態
              if (state.selected !== index) go({ frame: stage.initial as Frame, selected: index, acted: false });
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={actionButton}
          disabled={state.acted}
          onClick={() => go({ frame: controls.action.results[state.selected ?? 0], acted: true })}
        >
          {controls.action.label}
        </button>
      </>
    );
  }

  const groupLabel = controls.kind === "choice" || controls.kind === "choiceAction" ? controls.label : "操作";

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-paper">
      <div className="flex items-start gap-3 border-b border-slate-200 px-3 py-3 sm:px-4">
        <div className="flex flex-1 flex-wrap gap-2" role="group" aria-label={groupLabel}>
          {controlRow}
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={!state.dirty}
          className="shrink-0 rounded px-1 py-1.5 text-[15px] text-slate-700 underline-offset-4 hover:underline disabled:cursor-default disabled:text-slate-400 disabled:no-underline"
        >
          ↺ 重來
        </button>
      </div>
      <div className="px-3 py-4 sm:px-4" role="img" aria-label={state.frame.caption}>
        <Scene stage={stage} frame={state.frame} animate={animate} />
      </div>
      <p className="border-t border-slate-200 px-3 py-3 text-base leading-7 text-ink sm:px-4" aria-live="polite">
        {state.frame.caption}
      </p>
    </div>
  );
}
