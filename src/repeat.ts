import dayjs from "dayjs";
import type { Todo } from "./types";
import { createEventTodo } from "./scheduleEvent";

export type RepeatType =
  "none" | "daily" | "weekly" | "biweekly" | "monthly" | "custom";

export const repeatOptions: { value: RepeatType; label: string }[] = [
  { value: "none", label: "しない" },
  { value: "daily", label: "毎日" },
  { value: "weekly", label: "毎週" },
  { value: "biweekly", label: "2週間ごと" },
  { value: "monthly", label: "毎月" },
  { value: "custom", label: "○日ごと" },
];

// 繰り返しの設定 (開始日時と間隔だけを保存し、各回の予定はその都度計算する)
export type RepeatRule = {
  id: string;
  name: string;
  priority: number;
  start: Date; // 1 回目の日時
  type: Exclude<RepeatType, "none">;
  customDays: number; // 「○日ごと」の日数
  doneTimes: number[]; // 完了にした回の日時 (ミリ秒)
  skippedTimes: number[]; // 削除した回の日時 (ミリ秒)
  eventMinutes?: number; // 予定のときだけ、何分間か (始まる時刻は start の時刻)
};

// 「毎週」「3日ごと」のような間隔の説明
export const getRepeatLabel = (
  type: Exclude<RepeatType, "none">,
  customDays: number,
): string => {
  if (type === "custom") {
    return `${customDays}日ごと`;
  }
  return repeatOptions.find((option) => option.value === type)?.label ?? "";
};

// 間隔の日数 (毎月は月によって日数が変わるので null)
const getIntervalDays = (rule: RepeatRule): number | null => {
  if (rule.type === "daily") return 1;
  if (rule.type === "weekly") return 7;
  if (rule.type === "biweekly") return 14;
  if (rule.type === "custom") return rule.customDays;
  return null;
};

// i 回目 (0 から数える) の日時
// (毎月で 31 日のように次の月にない日は、dayjs がその月の末日に合わせる)
const getNthDate = (rule: RepeatRule, i: number): dayjs.Dayjs => {
  const days = getIntervalDays(rule);
  return days === null
    ? dayjs(rule.start).add(i, "month")
    : dayjs(rule.start).add(i * days, "day");
};

// 各回の予定を、ほかのタスクと同じ形 (Todo) で表すときの ID
const occurrenceSeparator = "@";
const getOccurrenceId = (ruleId: string, time: number) =>
  `${ruleId}${occurrenceSeparator}${time}`;

// 繰り返しの回の ID なら、元の設定の ID とその回の日時を返す (ふつうのタスクなら null)
export const parseOccurrenceId = (
  id: string,
): { ruleId: string; time: number } | null => {
  const [ruleId, time] = id.split(occurrenceSeparator);
  if (time === undefined) {
    return null;
  }
  return { ruleId, time: Number(time) };
};

// from 以上 to より前にある回を、Todo の形で返す (削除した回は除く)
export const getOccurrences = (
  rule: RepeatRule,
  from: Date,
  to: Date,
): Todo[] => {
  // 1 回目から順に数えると先の月ほど遅くなるので、from の少し手前から数え始める
  let i = 0;
  if (from > rule.start) {
    const days = getIntervalDays(rule);
    i =
      days === null
        ? dayjs(from).diff(rule.start, "month") - 1
        : Math.floor(dayjs(from).diff(rule.start, "day") / days) - 1;
    i = Math.max(0, i);
  }

  const occurrences: Todo[] = [];
  for (; ; i++) {
    const date = getNthDate(rule, i);
    if (!date.isBefore(to)) {
      break;
    }
    const time = date.valueOf();
    if (date.isBefore(from) || rule.skippedTimes.includes(time)) {
      continue;
    }
    const base = {
      id: getOccurrenceId(rule.id, time),
      name: rule.name,
      isDone: rule.doneTimes.includes(time),
      priority: rule.priority,
      repeatId: rule.id,
    };
    occurrences.push(
      rule.eventMinutes === undefined
        ? { ...base, deadline: date.toDate() }
        : createEventTodo(base, {
            start: date.toDate(),
            end: date.add(rule.eventMinutes, "minute").toDate(),
          }),
    );
  }
  return occurrences;
};

// 追加フォームで見せる、最初の数回分の日時
export const getFirstDates = (
  start: Date,
  type: Exclude<RepeatType, "none">,
  customDays: number,
  count: number,
): Date[] => {
  const rule: RepeatRule = {
    id: "",
    name: "",
    priority: 0,
    start,
    type,
    customDays,
    doneTimes: [],
    skippedTimes: [],
  };
  return [...Array(count).keys()].map((i) => getNthDate(rule, i).toDate());
};
