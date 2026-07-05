import { learningPaths } from "../lib/catalog";
import type { ProgressStatus } from "../types";
import { statusLabels, statusOptions } from "../lib/progress";

type FiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  pathId?: string;
  onPathChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: ProgressStatus | "all") => void;
  difficulty?: string;
  onDifficultyChange?: (value: string) => void;
  tag?: string;
  tags?: string[];
  onTagChange?: (value: string) => void;
};

export default function Filters({
  query,
  onQueryChange,
  pathId,
  onPathChange,
  status,
  onStatusChange,
  difficulty,
  onDifficultyChange,
  tag,
  tags,
  onTagChange
}: FiltersProps) {
  return (
    <div className="card mb-4 grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-5">
      <input
        className="form-input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="搜尋"
      />
      {onPathChange ? (
        <select className="form-input" value={pathId ?? "all"} onChange={(event) => onPathChange(event.target.value)}>
          <option value="all">全部路線</option>
          {learningPaths.map((path) => (
            <option key={path.id} value={path.id}>
              {path.title}
            </option>
          ))}
        </select>
      ) : null}
      {onStatusChange ? (
        <select
          className="form-input"
          value={status ?? "all"}
          onChange={(event) => onStatusChange(event.target.value as ProgressStatus | "all")}
        >
          <option value="all">全部狀態</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {statusLabels[item]}
            </option>
          ))}
        </select>
      ) : null}
      {onDifficultyChange ? (
        <select className="form-input" value={difficulty ?? "all"} onChange={(event) => onDifficultyChange(event.target.value)}>
          <option value="all">全部難度</option>
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
      ) : null}
      {onTagChange && tags ? (
        <select className="form-input" value={tag ?? "all"} onChange={(event) => onTagChange(event.target.value)}>
          <option value="all">全部標籤</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
