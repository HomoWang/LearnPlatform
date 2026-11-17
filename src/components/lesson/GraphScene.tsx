import type { GraphView } from "../../types";

type Layout = Record<string, { col: number; lane: number; parents: string[] }>;

const COL = 130;
const LANE = 76;
const PAD_X = 60;
const TOP = 74;
const R = 18;
const LABEL_H = 28;
const HERE_W = 84;
const INK = "#453A2F";
const LINE = "#B4A28C";
const MAIN = "main";

/** 15px 等寬字的大約寬度 */
const textWidth = (text: string) => text.length * 9.1 + 18;

/** 一張標籤的位置：main 一律在 commit 上方，其他分支在下方 */
function labelBox(name: string, x: number, y: number) {
  const w = textWidth(name);
  const above = name === MAIN;
  return { w, x: x - w / 2, y: above ? y - R - 12 - LABEL_H : y + R + 12, above };
}

/** 依整張卡會出現的所有畫面算出固定的畫布大小，畫面切換時圖不會跳動 */
export function graphSize(layout: Layout, views: GraphView[]) {
  const ids = Object.keys(layout);
  const maxCol = Math.max(...ids.map((id) => layout[id].col));
  const maxLane = Math.max(...ids.map((id) => layout[id].lane));
  const hasBelow = maxLane > 0 || views.some((v) => v.refs.some((r) => r.name !== MAIN));
  let right = PAD_X * 2 + maxCol * COL;
  for (const view of views)
    for (const ref of view.refs) {
      const p = layout[ref.at];
      const box = labelBox(ref.name, PAD_X + p.col * COL, 0);
      right = Math.max(right, box.x + box.w + (view.here === ref.name ? HERE_W + 10 : 0) + 12);
    }
  const height = TOP + maxLane * LANE + (hasBelow ? R + 12 + LABEL_H + 16 : R + 22);
  return { width: Math.ceil(right), height };
}

export default function GraphScene({
  layout,
  view,
  size,
  animate
}: {
  layout: Layout;
  view: GraphView;
  size: { width: number; height: number };
  animate: boolean;
}) {
  const pos = (id: string) => ({ x: PAD_X + layout[id].col * COL, y: TOP + layout[id].lane * LANE });
  const shown = new Set(view.commits);
  const focus = new Set(view.focus ?? []);
  const ids = Object.keys(layout);
  const edges = ids.flatMap((id) => layout[id].parents.map((parent) => ({ id, parent })));
  const transition = animate ? "transform 420ms ease, opacity 300ms ease" : "none";

  // 同一顆 commit 上有兩張下方標籤時往下疊
  const stackIndex = new Map<string, number>();
  const refs = view.refs.map((ref) => {
    const key = `${ref.at}:${ref.name === MAIN ? "up" : "down"}`;
    const n = stackIndex.get(key) ?? 0;
    stackIndex.set(key, n + 1);
    const p = pos(ref.at);
    const box = labelBox(ref.name, p.x, p.y);
    const offset = n * (LABEL_H + 6) * (box.above ? -1 : 1);
    return { ...ref, ...box, y: box.y + offset };
  });

  return (
    <div className="overflow-x-auto">
      <svg
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="mx-auto block"
        aria-hidden="true"
      >
        {edges.map(({ id, parent }) => {
          const a = pos(parent);
          const b = pos(id);
          const visible = shown.has(id) && shown.has(parent);
          const d =
            a.y === b.y
              ? `M ${a.x} ${a.y} L ${b.x} ${b.y}`
              : `M ${a.x} ${a.y} C ${a.x + COL * 0.55} ${a.y}, ${b.x - COL * 0.55} ${b.y}, ${b.x} ${b.y}`;
          return (
            <path
              key={`${parent}-${id}`}
              d={d}
              fill="none"
              stroke={LINE}
              strokeWidth={2.5}
              style={{ opacity: visible ? 1 : 0, transition: animate ? "opacity 300ms ease" : "none" }}
            />
          );
        })}

        {ids.map((id) => {
          const { x, y } = pos(id);
          const visible = shown.has(id);
          const isFocus = focus.has(id);
          return (
            <g
              key={id}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${visible ? 1 : 0.6})`,
                opacity: visible ? 1 : 0,
                transition
              }}
            >
              <circle r={R} fill="#FFFFFF" stroke={isFocus ? INK : LINE} strokeWidth={isFocus ? 2.5 : 1.5} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} fill={INK}>
                {id}
              </text>
            </g>
          );
        })}

        {refs.map((ref) => {
          const isFocus = focus.has(ref.name);
          const isHere = view.here === ref.name;
          return (
            <g key={ref.name} style={{ transform: `translate(${ref.x}px, ${ref.y}px)`, transition }}>
              <rect
                width={ref.w}
                height={LABEL_H}
                rx={5}
                fill="#FFFFFF"
                stroke={isFocus ? INK : LINE}
                strokeWidth={isFocus ? 2 : 1}
              />
              <text
                x={ref.w / 2}
                y={LABEL_H / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontFamily="ui-monospace, Consolas, 'Courier New', monospace"
                fill={INK}
              >
                {ref.name}
              </text>
              {isHere ? (
                <g transform={`translate(${ref.w + 10}, 0)`}>
                  <path d={`M 0 ${LABEL_H / 2} L 8 ${LABEL_H / 2 - 6} L 8 ${LABEL_H / 2 + 6} Z`} fill={INK} />
                  <rect x={7} width={HERE_W - 7} height={LABEL_H} rx={5} fill={INK} />
                  <text
                    x={7 + (HERE_W - 7) / 2}
                    y={LABEL_H / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={15}
                    fill="#FFFFFF"
                  >
                    你在這裡
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
