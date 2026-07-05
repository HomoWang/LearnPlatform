import type { ProgressItemType, ProgressStatus, UserProgress } from "../types";

export const statusLabels: Record<ProgressStatus, string> = {
  not_started: "未開始",
  in_progress: "學習中",
  completed: "已完成",
  review: "需要複習",
  practical_ready: "已能實作",
  interview_ready: "已能面試說明"
};

export const statusOptions: ProgressStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "review",
  "practical_ready",
  "interview_ready"
];

export function getStatus(
  progress: UserProgress[],
  itemId: string,
  itemType: ProgressItemType
): ProgressStatus {
  return (
    progress.find((item) => item.itemId === itemId && item.itemType === itemType)?.status ??
    "not_started"
  );
}

export function upsertStatus(
  progress: UserProgress[],
  itemId: string,
  itemType: ProgressItemType,
  status: ProgressStatus
): UserProgress[] {
  const updatedAt = new Date().toISOString();
  const exists = progress.some((item) => item.itemId === itemId && item.itemType === itemType);

  if (!exists) {
    return [...progress, { itemId, itemType, status, updatedAt }];
  }

  return progress.map((item) =>
    item.itemId === itemId && item.itemType === itemType ? { ...item, status, updatedAt } : item
  );
}

export function isDone(status: ProgressStatus) {
  return status === "completed" || status === "practical_ready" || status === "interview_ready";
}

export function completionPercent(
  ids: string[],
  itemType: ProgressItemType,
  progress: UserProgress[]
) {
  if (ids.length === 0) {
    return 0;
  }

  const done = ids.filter((id) => isDone(getStatus(progress, id, itemType))).length;
  return Math.round((done / ids.length) * 100);
}

export function countByStatus(
  ids: string[],
  itemType: ProgressItemType,
  progress: UserProgress[],
  predicate: (status: ProgressStatus) => boolean
) {
  return ids.filter((id) => predicate(getStatus(progress, id, itemType))).length;
}
