import { useState } from "react";
import type { Todo } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import DeadlineInput from "./DeadlineInput";
import { endOfDay, formatDeadline } from "./deadline";
import { priorityLabels, priorityStars } from "./priority";
import PixelIcon from "./PixelIcon";
import { heartIcon, calendarIcon, trashIcon, checkIcon } from "./pixelIcons";
import CommandButton from "./CommandButton";
import SmoothHeight from "./SmoothHeight";
import {
  canCheck,
  formatEventTime,
  getCheckLockMessage,
} from "./scheduleEvent";

type Props = {
  todo: Todo;
  updateIsDone: (id: string, value: boolean) => void;
  updateDeadline: (id: string, deadline: Date | null) => void;
  remove: (id: string) => void;
  now: number; // 今の時刻 (期限切れかどうかと、期限の文字の色に使う)
};

const hour = 60 * 60 * 1000;

const TodoItem = (props: Props) => {
  const todo = props.todo;
  // 日時を決める入力欄を開いているか、と入力途中の期限
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  // (最初は今日のその日中にしておき、ホイールで変える)
  const [deadlineInput, setDeadlineInput] = useState<Date | null>(() =>
    endOfDay(new Date()),
  );
  const isOverdue =
    !todo.isDone &&
    todo.deadline !== null &&
    todo.deadline.getTime() < props.now;
  // 期限までの残り時間で、期限の文字の色を変える
  // (1 時間以内 → 赤、24 時間以内 → 黄色、それより先 → 緑。完了済みは灰色のまま)
  const remaining =
    todo.deadline === null ? null : todo.deadline.getTime() - props.now;
  const deadlineColor =
    todo.isDone || remaining === null
      ? "text-gray-400"
      : remaining <= hour
        ? "text-ut-red"
        : remaining <= 24 * hour
          ? "text-ut-yellow"
          : "text-ut-green";

  const saveDeadline = () => {
    if (deadlineInput === null) {
      return;
    }
    props.updateDeadline(todo.id, deadlineInput);
    setIsEditingDeadline(false);
    setDeadlineInput(endOfDay(new Date()));
  };

  return (
    // 一覧に出てきたときは、左からスッと出す
    <div className="ut-box px-4 py-2 motion-safe:animate-enter">
      {/* 日時を決める欄を開け閉めしたときに、枠を滑らかに伸び縮みさせる */}
      <SmoothHeight>
        <div className="flex items-center justify-between gap-3">
          <div
            className={twMerge(
              "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1",
              todo.isDone && "opacity-50",
            )}
          >
            <label className="flex min-w-0 cursor-pointer items-center">
              <input
                type="checkbox"
                checked={todo.isDone}
                // 予定は、終わってからその日のうちだけチェックできる
                disabled={!canCheck(todo, props.now)}
                onChange={(e) => props.updateIsDone(todo.id, e.target.checked)}
                className="mr-3 size-4 shrink-0 cursor-pointer accent-ut-yellow disabled:cursor-not-allowed disabled:opacity-40"
              />
              <PixelIcon
                pixels={heartIcon}
                className={twMerge(
                  "mr-2 h-3.5 w-4 shrink-0 text-ut-red",
                  // 完了にした瞬間、ハートがポンと弾けて灰色になる
                  todo.isDone && "text-gray-500 motion-safe:animate-pop",
                )}
              />
              <span
                className={twMerge(
                  "min-w-0 text-lg wrap-anywhere",
                  todo.isDone && "line-through",
                )}
              >
                {todo.name}
              </span>
            </label>
            <span
              aria-label={`優先度: ${priorityLabels[todo.priority]}`}
              className="tracking-tighter text-ut-yellow"
            >
              {priorityStars(todo.priority)}
            </span>
            {todo.deadline && (
              <span
                className={twMerge("flex items-center text-sm", deadlineColor)}
              >
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                {todo.event !== undefined
                  ? formatEventTime(todo.event, "YYYY/MM/DD")
                  : formatDeadline(todo.deadline)}
                {isOverdue && (
                  <span className="ml-1 inline-block motion-safe:animate-shake">
                    (期限切れ)
                  </span>
                )}
              </span>
            )}
            {todo.event !== undefined && (
              <span className="border border-ut-orange bg-ut-orange px-2 text-xs text-black">
                予定
              </span>
            )}
            {todo.repeatId && (
              <span className="border border-ut-orange px-2 text-xs text-ut-orange">
                くり返し
              </span>
            )}
            {todo.isDone && (
              <span className="border border-white px-2 text-xs">完了済み</span>
            )}
            {getCheckLockMessage(todo, props.now) !== null && !isOverdue && (
              <span className="w-full text-xs text-gray-500">
                ＊ {getCheckLockMessage(todo, props.now)}
              </span>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {todo.deadline === null && !todo.isDone && !isEditingDeadline && (
              <CommandButton
                icon={calendarIcon}
                size="sm"
                onClick={() => setIsEditingDeadline(true)}
              >
                日時を決める
              </CommandButton>
            )}
            <CommandButton
              icon={trashIcon}
              size="sm"
              onClick={() => props.remove(todo.id)}
              aria-label={`${todo.name}を削除`}
            >
              削除
            </CommandButton>
          </div>
        </div>

        {isEditingDeadline && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveDeadline();
            }}
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <DeadlineInput
              id={`deadline-${todo.id}`}
              label={`${todo.name}の期限`}
              value={deadlineInput}
              onChange={setDeadlineInput}
            />
            <CommandButton
              icon={checkIcon}
              size="sm"
              type="submit"
              disabled={deadlineInput === null}
            >
              決定
            </CommandButton>
            <button
              type="button"
              onClick={() => setIsEditingDeadline(false)}
              className="cursor-pointer px-2 py-0.5 text-sm text-gray-400 hover:text-white"
            >
              やめる
            </button>
          </form>
        )}
      </SmoothHeight>
    </div>
  );
};

export default TodoItem;
