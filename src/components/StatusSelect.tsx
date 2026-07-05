import { statusLabels, statusOptions } from "../lib/progress";
import type { ProgressStatus } from "../types";

type StatusSelectProps = {
  value: ProgressStatus;
  onChange: (status: ProgressStatus) => void;
};

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <select
      className="form-input min-w-32 py-1.5 text-xs"
      value={value}
      onChange={(event) => onChange(event.target.value as ProgressStatus)}
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {statusLabels[status]}
        </option>
      ))}
    </select>
  );
}
