import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import type { Todo } from "./types";
import { getSortTime } from "./scheduleEvent";

type Props = {
  date: Date; // 選んでいる日 (この日の月を表示する)
  todos: Todo[];
  onSelectDay: (date: Date) => void;
  onChangeMonth: (date: Date) => void; // 上下のスクロールで月を切り替えたとき
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const maxVisibleTodos = 2; // 1 マスに書ける予定の数。残りは「+n件」にする
const wheelThreshold = 50; // これだけホイールを回したら月を切り替える
const wheelPause = 200; // 切り替えたあと、ホイールがこの時間止まるまでは次へ進まない (ミリ秒)
const swipeThreshold = 50; // これだけ上下にスワイプしたら月を切り替える (px)

// 選んでいる月のカレンダー。各日のマスに予定を書き、押すとその日を選ぶ
// 上下にスクロール (スマホではスワイプ) すると、前後の月に切り替わる
const Calendar = (props: Props) => {
  const selected = dayjs(props.date);
  const firstDay = selected.startOf("month");
  const today = dayjs();
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef({ total: 0, lockedUntil: 0 });
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // 前に表示していた月と比べて、次の月なら下から、前の月なら上から滑り込ませる
  const monthKey = firstDay.format("YYYY-MM");
  const [shown, setShown] = useState<{
    key: string;
    direction: "next" | "prev" | null;
  }>({ key: monthKey, direction: null });
  if (shown.key !== monthKey) {
    setShown({
      key: monthKey,
      direction: monthKey > shown.key ? "next" : "prev",
    });
  }

  // diff か月先 (マイナスなら前) に切り替える (31 日などは dayjs がその月の末日に合わせる)
  const changeMonth = (diff: number) => {
    props.onChangeMonth(selected.add(diff, "month").toDate());
  };

  // ホイールで月を切り替える
  // (ページ全体がスクロールしないよう止めるため、passive: false で登録する)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) {
        return; // 横方向のスクロールは何もしない
      }
      // カレンダーが画面からはみ出しているうちは、先にページをスクロールして全体を見せる
      const rect = root.getBoundingClientRect();
      const page = document.documentElement;
      const canScrollDown =
        window.scrollY + window.innerHeight < page.scrollHeight - 1;
      const canScrollUp = window.scrollY > 0;
      if (
        (e.deltaY > 0 && rect.bottom > window.innerHeight && canScrollDown) ||
        (e.deltaY < 0 && rect.top < 0 && canScrollUp)
      ) {
        wheelRef.current.total = 0;
        return;
      }
      e.preventDefault();
      const wheel = wheelRef.current;
      const now = Date.now();
      // タッチパッドの慣性スクロールで何か月も進まないよう、
      // 切り替えた直後はホイールが止まるまで待つ
      if (now < wheel.lockedUntil) {
        wheel.lockedUntil = now + wheelPause;
        return;
      }
      wheel.total += e.deltaY;
      if (Math.abs(wheel.total) >= wheelThreshold) {
        changeMonth(wheel.total > 0 ? 1 : -1);
        wheel.total = 0;
        wheel.lockedUntil = now + wheelPause;
      }
    };
    root.addEventListener("wheel", handleWheel, { passive: false });
    return () => root.removeEventListener("wheel", handleWheel);
  });

  // スマホでは上下のスワイプで月を切り替える (上へスワイプで次の月)
  const handleTouchStart = (e: TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) {
      return;
    }
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dy) >= swipeThreshold && Math.abs(dy) > Math.abs(dx)) {
      changeMonth(dy < 0 ? 1 : -1);
    }
  };

  // 1 日の前の空きマス (null) と、1 日〜月末の日付を並べる
  const cells: (dayjs.Dayjs | null)[] = [];
  for (let i = 0; i < firstDay.day(); i++) {
    cells.push(null);
  }
  for (let d = 1; d <= selected.daysInMonth(); d++) {
    cells.push(firstDay.date(d));
  }

  return (
    <div
      ref={rootRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="touch-pan-x overflow-hidden ut-box p-1"
    >
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="前の月"
          className="cursor-pointer px-2 text-ut-orange hover:text-ut-yellow"
        >
          ▲
        </button>
        <span className="text-ut-yellow">{firstDay.format("YYYY年M月")}</span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="次の月"
          className="cursor-pointer px-2 text-ut-orange hover:text-ut-yellow"
        >
          ▼
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {weekdays.map((weekday, i) => (
          <div
            key={weekday}
            className={twMerge(
              "py-1 text-gray-400",
              i === 0 && "text-ut-red",
              i === 6 && "text-sky-400",
            )}
          >
            {weekday}
          </div>
        ))}
      </div>
      <div
        key={monthKey}
        className={twMerge(
          "grid grid-cols-7 gap-px",
          shown.direction === "next" && "animate-slide-from-below",
          shown.direction === "prev" && "animate-slide-from-above",
        )}
      >
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }
          const dayTodos = props.todos
            .filter((todo) => dayjs(todo.deadline).isSame(day, "day"))
            .sort((a, b) => getSortTime(a) - getSortTime(b));
          const hiddenCount = dayTodos.length - maxVisibleTodos;
          return (
            <button
              key={day.date()}
              type="button"
              onClick={() => props.onSelectDay(day.toDate())}
              aria-label={`${day.format("M月D日")} 予定${dayTodos.length}件`}
              className={twMerge(
                "flex min-h-16 min-w-0 cursor-pointer flex-col border-2 border-gray-700 p-0.5 text-left hover:border-ut-orange sm:min-h-20",
                day.isSame(selected, "day") && "border-ut-yellow",
              )}
            >
              {/* 選んでいる日の数字はゆらゆら揺らし、今日の数字はキラッと光らせる */}
              <span
                className={twMerge(
                  "self-start text-sm text-gray-400",
                  day.isSame(today, "day") &&
                    "text-ut-yellow motion-safe:animate-twinkle",
                  day.isSame(selected, "day") && "motion-safe:animate-wobble",
                )}
              >
                {day.date()}
              </span>
              {dayTodos.slice(0, maxVisibleTodos).map((todo) => (
                <span
                  key={todo.id}
                  className={twMerge(
                    "truncate text-[10px] leading-tight sm:text-xs",
                    todo.isDone && "text-gray-500 line-through",
                  )}
                >
                  {todo.name}
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="text-[10px] text-ut-orange sm:text-xs">
                  +{hiddenCount}件
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
