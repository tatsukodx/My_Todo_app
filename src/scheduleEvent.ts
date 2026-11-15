import dayjs from "dayjs";
import { endOfDay } from "./deadline";
import type { Todo, TodoEvent } from "./types";

// 予定 (習い事など) は、終わった後、その日のうちにチェックすると報酬がもらえる
// そのため、予定の期限は「その日の終わり」にしておく (過ぎるとタスクと同じくダメージ)

// 予定を Todo の形にする
export const createEventTodo = (
  base: Omit<Todo, "deadline" | "event">,
  event: TodoEvent,
): Todo => ({
  ...base,
  deadline: endOfDay(event.start),
  event,
});

// 予定のチェックを付けられるか
// (終わる前と、その日が過ぎた後は付けられない。付けたチェックを外すのはいつでもできる)
export const canCheck = (todo: Todo, now: number): boolean => {
  if (todo.event === undefined || todo.isDone) {
    return true;
  }
  return (
    now >= todo.event.end.getTime() &&
    todo.deadline !== null &&
    now <= todo.deadline.getTime()
  );
};

// チェックを付けられないときの理由
export const getCheckLockMessage = (todo: Todo, now: number): string | null => {
  if (canCheck(todo, now) || todo.event === undefined) {
    return null;
  }
  return now < todo.event.end.getTime()
    ? `${dayjs(todo.event.end).format("HH:mm")} に終わったらチェックできます`
    : "チェックできる日が過ぎました";
};

// 「16:00〜17:30」のような時間の表示 (format に日付の書き方を渡すと、前に日付も付ける)
export const formatEventTime = (event: TodoEvent, format?: string): string =>
  `${format === undefined ? "" : `${dayjs(event.start).format(format)} `}${dayjs(
    event.start,
  ).format("HH:mm")}〜${dayjs(event.end).format("HH:mm")}`;

// 並べるときの基準の日時 (予定は始まる日時、タスクは期限)
export const getSortTime = (todo: Todo): number =>
  todo.event !== undefined
    ? todo.event.start.getTime()
    : todo.deadline === null
      ? Infinity
      : todo.deadline.getTime();

// 新しい予定のはじめの値 (今日の、次のちょうどの時刻から 1 時間。遅くても 22:00〜23:00)
export const createDefaultEvent = (): TodoEvent => {
  const start = dayjs()
    .startOf("hour")
    .hour(Math.min(dayjs().hour() + 1, 22));
  return { start: start.toDate(), end: start.add(1, "hour").toDate() };
};

// 終わりが始まりより後になっているか (予定は 1 日の中で決める)
export const isEventTimeValid = (event: TodoEvent): boolean =>
  event.end > event.start;
