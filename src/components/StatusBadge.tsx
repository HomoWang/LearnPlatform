import { statusLabels } from "../lib/progress";
import type { ProgressStatus } from "../types";

const badgeClasses: Record<ProgressStatus, string> = {
  not_started: "bg-slate-100 text-slate-600 border-slate-200",
  in_progress: "bg-sky-50 text-sky-700 border-sky-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  practical_ready: "bg-indigo-50 text-indigo-700 border-indigo-200",
  interview_ready: "bg-teal-50 text-teal-700 border-teal-200"
};

type StatusBadgeProps = {
  status: ProgressStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold ${badgeClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
