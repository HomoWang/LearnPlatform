import { statusLabels } from "../lib/progress";
import type { ProgressStatus } from "../types";

const badgeClasses: Record<ProgressStatus, string> = {
  not_started: "bg-white text-slate-500 border-slate-300",
  in_progress: "bg-net-tint text-net-deep border-net",
  completed: "bg-dba-tint text-dba-deep border-dba",
  review: "bg-teal-100 text-teal-800 border-teal-400",
  practical_ready: "bg-dev-tint text-dev-deep border-dev",
  interview_ready: "bg-butter text-ink border-ink"
};

type StatusBadgeProps = {
  status: ProgressStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex -rotate-2 whitespace-nowrap rounded-md border-2 px-2 py-0.5 text-xs font-semibold ${badgeClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
