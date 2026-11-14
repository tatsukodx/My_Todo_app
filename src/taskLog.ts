import dayjs from "dayjs";
import type { Todo } from "./types";
import { parseOccurrenceId } from "./repeat";

// 作業報告書の 1 行分の記録
// done: タスクを完了した / overdue: 未完了のまま期限が過ぎた (ダメージを受けた)
export type LogEntry = {
  id: string; // 記録そのものの ID
  todoId: string;
  type: "done" | "overdue";
  name: string;
  priority: number;
  deadline: number | null; // 期限 (ミリ秒)。期限なしは null
  recordedAt: number; // 完了した (または期限切れになった) 日時 (ミリ秒)
  onTime: boolean | null; // 期限内に完了できたか (期限なし・期限切れの記録は null)
  isRepeat: boolean; // 繰り返しタスクの回か
  exp: number; // もらった経験値
  gold: number; // もらった GOLD
  damage: number; // 受けたダメージ
  canceled?: boolean; // 完了を取り消した記録 (報告書には出さない)
};

export const createLogEntry = (
  todo: Todo,
  type: LogEntry["type"],
  recordedAt: number,
  rewards: { exp?: number; gold?: number; damage?: number },
): LogEntry => {
  const deadline = todo.deadline === null ? null : todo.deadline.getTime();
  return {
    id: `${todo.id}#${type}#${recordedAt}`,
    todoId: todo.id,
    type,
    name: todo.name,
    priority: todo.priority,
    deadline,
    recordedAt,
    onTime:
      type === "done" && deadline !== null ? recordedAt <= deadline : null,
    isRepeat: parseOccurrenceId(todo.id) !== null,
    exp: rewards.exp ?? 0,
    gold: rewards.gold ?? 0,
    damage: rewards.damage ?? 0,
  };
};

// 完了を記録する。取り消した記録が残っていれば、もらった報酬を引き継いで完了に戻す
// (報酬は 1 つのタスクで 1 回しかもらえないので、2 回目の完了では 0 になるため)
export const recordDone = (
  log: LogEntry[],
  todo: Todo,
  recordedAt: number,
  rewards: { exp: number; gold: number },
): LogEntry[] => {
  const index = log.findLastIndex(
    (entry) =>
      entry.todoId === todo.id && entry.type === "done" && entry.canceled,
  );
  if (index === -1) {
    return [...log, createLogEntry(todo, "done", recordedAt, rewards)];
  }
  const canceled = log[index];
  const restored = createLogEntry(todo, "done", recordedAt, {
    exp: canceled.exp + rewards.exp,
    gold: canceled.gold + rewards.gold,
  });
  return log.map((entry, i) => (i === index ? restored : entry));
};

// 完了を取り消したときは、そのタスクのいちばん新しい完了の記録に「取り消し」の印を付ける
export const cancelLatestDone = (
  log: LogEntry[],
  todoId: string,
): LogEntry[] => {
  const index = log.findLastIndex(
    (entry) =>
      entry.todoId === todoId && entry.type === "done" && !entry.canceled,
  );
  return index === -1
    ? log
    : log.map((entry, i) =>
        i === index ? { ...entry, canceled: true } : entry,
      );
};

// 指定した月の記録 (新しい順。取り消した記録は除く)
export const getMonthLog = (log: LogEntry[], month: Date): LogEntry[] =>
  log
    .filter(
      (entry) =>
        !entry.canceled && dayjs(entry.recordedAt).isSame(month, "month"),
    )
    .sort((a, b) => b.recordedAt - a.recordedAt);

export type LogSummary = {
  doneCount: number;
  onTimeCount: number;
  lateCount: number;
  noDeadlineCount: number;
  overdueCount: number;
  onTimeRate: number | null; // 期限のある完了のうち、期限内だった割合 (%)。対象がなければ null
  exp: number;
  gold: number;
  damage: number;
};

export const summarizeLog = (log: LogEntry[]): LogSummary => {
  const done = log.filter((entry) => entry.type === "done");
  const onTimeCount = done.filter((entry) => entry.onTime === true).length;
  const lateCount = done.filter((entry) => entry.onTime === false).length;
  const withDeadline = onTimeCount + lateCount;
  return {
    doneCount: done.length,
    onTimeCount,
    lateCount,
    noDeadlineCount: done.length - withDeadline,
    overdueCount: log.filter((entry) => entry.type === "overdue").length,
    onTimeRate:
      withDeadline === 0
        ? null
        : Math.round((onTimeCount / withDeadline) * 100),
    exp: log.reduce((sum, entry) => sum + entry.exp, 0),
    gold: log.reduce((sum, entry) => sum + entry.gold, 0),
    damage: log.reduce((sum, entry) => sum + entry.damage, 0),
  };
};
