import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import type { Todo } from "./types";
import PixelIcon from "./PixelIcon";
import { isAllDay } from "./deadline";
import { priorityStars } from "./priority";
import { heartIcon } from "./pixelIcons";
import {
  canCheck,
  formatEventTime,
  getCheckLockMessage,
  getSortTime,
} from "./scheduleEvent";

type Props = {
  date: Date;
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  now: number; // 今の時刻 (予定のチェックを付けられるかどうかに使う)
};

const hours = [...Array(24).keys()]; // 0 〜 23

// 選んだ日の 0 時〜 23 時を 1 時間ずつ並べ、期限の時刻の行にタスクを置く
const Timetable = (props: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isToday = dayjs(props.date).isSame(new Date(), "day");
  const currentHour = new Date().getHours();

  const dayTodos = props.todos
    .filter((todo) => dayjs(todo.deadline).isSame(props.date, "day"))
    .sort((a, b) => getSortTime(a) - getSortTime(b));
  // 時刻を決めていない (その日中が期限の) タスクは、時刻の行ではなく一番上の「その日中」に出す
  // (予定の期限もその日の終わりだが、予定は始まる時刻の行に出す)
  const allDayTodos = dayTodos.filter(
    (todo) =>
      todo.event === undefined &&
      todo.deadline !== null &&
      isAllDay(todo.deadline),
  );
  const timedTodos = dayTodos.filter((todo) => !allDayTodos.includes(todo));
  // その行に置く時刻 (予定は始まる時刻、タスクは期限)
  const getHour = (todo: Todo) => dayjs(getSortTime(todo)).hour();

  // タイムテーブルに並べるタスク 1 件分
  const renderTodo = (todo: Todo) => (
    // 日を切り替えると、その日のタスクが左からスッと出てくる
    <label
      key={`${props.date.valueOf()}-${todo.id}`}
      title={getCheckLockMessage(todo, props.now) ?? undefined}
      className={twMerge(
        "flex cursor-pointer items-center gap-2 border-2 border-white px-2 py-1 motion-safe:animate-enter",
        // 予定は、タスクと見分けられるようオレンジの枠にする
        todo.event !== undefined && "border-ut-orange",
        todo.isDone && "border-gray-600 text-gray-500 line-through",
      )}
    >
      <input
        type="checkbox"
        checked={todo.isDone}
        disabled={!canCheck(todo, props.now)}
        onChange={(e) => props.updateIsDone(todo.id, e.target.checked)}
        className="size-4 shrink-0 cursor-pointer accent-ut-yellow disabled:cursor-not-allowed disabled:opacity-40"
      />
      {todo.event !== undefined ? (
        <span className="shrink-0 text-sm text-ut-orange">
          {formatEventTime(todo.event)}
        </span>
      ) : (
        todo.deadline !== null &&
        !isAllDay(todo.deadline) && (
          <span className="text-sm text-gray-400">
            {dayjs(todo.deadline).format("HH:mm")}
          </span>
        )
      )}
      <span className="min-w-0 wrap-anywhere">{todo.name}</span>
      <span className="ml-auto shrink-0 text-sm tracking-tighter text-ut-yellow">
        {priorityStars(todo.priority)}
      </span>
    </label>
  );

  // 今日なら今の時刻、それ以外は最初のタスク (なければ 8 時) の行までスクロールする
  const firstHour = timedTodos.length > 0 ? getHour(timedTodos[0]) : 8;
  const scrollHour = isToday ? currentHour : firstHour;
  useEffect(() => {
    const container = scrollRef.current;
    const row = container?.querySelector<HTMLElement>(
      `[data-hour="${scrollHour}"]`,
    );
    if (container && row) {
      container.scrollTop = row.offsetTop;
    }
  }, [props.date, scrollHour]);

  return (
    <div className="ut-box">
      <div className="border-b-2 border-white px-3 py-1 text-sm text-gray-400">
        この日のタスク：{dayTodos.length}件
      </div>
      {allDayTodos.length > 0 && (
        <div className="flex border-b-2 border-white">
          <div className="w-16 shrink-0 border-r border-gray-700 px-1 py-1.5 text-xs whitespace-nowrap text-ut-yellow">
            その日中
          </div>
          <div className="flex min-w-0 grow flex-col gap-1 p-1">
            {allDayTodos.map(renderTodo)}
          </div>
        </div>
      )}
      <div ref={scrollRef} className="relative h-[55vh] overflow-y-auto">
        {hours.map((hour) => {
          const hourTodos = timedTodos.filter((todo) => getHour(todo) === hour);
          // 前の時間から続いている予定 (この時間にもまだ終わっていないもの)
          const rowStart = dayjs(props.date).hour(hour).startOf("hour");
          const continuingEvents = timedTodos.filter(
            (todo) =>
              todo.event !== undefined &&
              getHour(todo) < hour &&
              todo.event.end > rowStart.toDate(),
          );
          const isNow = isToday && hour === currentHour;
          return (
            <div
              key={hour}
              data-hour={hour}
              className="flex min-h-12 border-b border-gray-700"
            >
              <div
                className={twMerge(
                  "flex w-16 shrink-0 items-start gap-1 border-r border-gray-700 px-2 py-1 text-sm text-gray-500",
                  isNow && "text-ut-yellow",
                )}
              >
                {isNow && (
                  <PixelIcon
                    pixels={heartIcon}
                    className="mt-1 h-2.5 w-3 text-ut-red motion-safe:animate-heartbeat"
                  />
                )}
                {String(hour).padStart(2, "0")}:00
              </div>
              <div className="flex min-w-0 grow flex-col gap-1 p-1">
                {continuingEvents.map((todo) => (
                  <div
                    key={`${todo.id}-continue`}
                    className={twMerge(
                      "border-l-4 border-ut-orange/60 pl-2 text-xs text-ut-orange/70",
                      todo.isDone && "border-gray-600 text-gray-600",
                    )}
                  >
                    {todo.name}（つづき）
                  </div>
                ))}
                {hourTodos.map(renderTodo)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timetable;
