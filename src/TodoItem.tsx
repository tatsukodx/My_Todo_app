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

type Props = {
  todo: Todo;
  updateIsDone: (id: string, value: boolean) => void;
  updateDeadline: (id: string, deadline: Date | null) => void;
  remove: (id: string) => void;
};

const TodoItem = (props: Props) => {
  const todo = props.todo;
  // 日時を決める入力欄を開いているか、と入力途中の期限
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  // (最初は今日のその日中にしておき、ホイールで変える)
  const [deadlineInput, setDeadlineInput] = useState<Date | null>(() =>
    endOfDay(new Date()),
  );
  const isOverdue =
    !todo.isDone && todo.deadline !== null && todo.deadline < new Date();

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
              onChange={(e) => props.updateIsDone(todo.id, e.target.checked)}
              className="mr-3 size-4 shrink-0 cursor-pointer accent-ut-yellow"
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
              className={twMerge(
                "flex items-center text-sm text-gray-400",
                isOverdue && "text-ut-red",
              )}
            >
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {formatDeadline(todo.deadline)}
              {isOverdue && (
                <span className="ml-1 inline-block motion-safe:animate-shake">
                  (期限切れ)
                </span>
              )}
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
    </div>
  );
};

export default TodoItem;
