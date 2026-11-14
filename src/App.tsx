import Star from "./Star";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { Todo } from "./types";
import { initTodos } from "./initTodos";
import TodoList from "./TodoList";
import DialogueBox from "./DialogueBox";
import type { SceneKey } from "./dialogues";
import { scenes, getStatusScene } from "./dialogues";
import { v4 as uuid } from "uuid";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import PixelIcon from "./PixelIcon";
import {
  heartIcon,
  plusIcon,
  broomIcon,
  talkIcon,
  reportIcon,
  timetableIcon,
  calendarIcon,
  trashIcon,
} from "./pixelIcons";
import CommandButton from "./CommandButton";
import DateSelector from "./DateSelector";
import Timetable from "./Timetable";
import Calendar from "./Calendar";
import type { RepeatRule, RepeatType } from "./repeat";
import {
  repeatOptions,
  getRepeatLabel,
  getOccurrences,
  parseOccurrenceId,
  getFirstDates,
} from "./repeat";
import BottomSheet from "./BottomSheet";
import type { Item, Player, UseResult } from "./game";
import {
  createPlayer,
  giveReward,
  getNewlyOverdue,
  takeDamage,
  revive,
  buyItem,
  consumeItem,
  isScreenEffectActive,
  getDamageFor,
} from "./game";
import StatusBar from "./StatusBar";
import Shop from "./Shop";
import NameEntry from "./NameEntry";
import GameOver from "./GameOver";
import type { LogEntry } from "./taskLog";
import { createLogEntry, recordDone, cancelLatestDone } from "./taskLog";
import WorkReport from "./WorkReport";
import DeadlineInput from "./DeadlineInput";
import { formatDeadline } from "./deadline";
import { priorityLabels } from "./priority";

const localStorageKey = "MyTodoApp";
const repeatStorageKey = "MyTodoAppRepeats"; // 繰り返しの設定の保存先
const playerStorageKey = "MyTodoAppPlayer"; // プレイヤー (HP・LV・GOLD など) の保存先
const logStorageKey = "MyTodoAppLog"; // 作業報告書の記録の保存先
const damageCheckInterval = 30_000; // 期限切れを調べる間隔 (ミリ秒)
const toastDuration = 2500; // 報酬やダメージの表示を出しておく時間
const repeatListDays = 7; // 今日から何日分の繰り返しタスクをやること一覧に出すか
const title = "ガスター研究室のスケジュール表";

type StoredTodo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: string | null;
  repeatId?: string;
};

const loadTodos = (): Todo[] => {
  const todoJsonStr = localStorage.getItem(localStorageKey);
  if (todoJsonStr === null) {
    return initTodos;
  }

  const storedTodos: StoredTodo[] = JSON.parse(todoJsonStr);
  return storedTodos.map((todo) => ({
    ...todo,
    deadline: todo.deadline === null ? null : new Date(todo.deadline),
  }));
};

type StoredRepeatRule = Omit<RepeatRule, "start"> & { start: string };

const loadRepeats = (): RepeatRule[] => {
  const jsonStr = localStorage.getItem(repeatStorageKey);
  if (jsonStr === null) {
    return [];
  }
  const storedRepeats: StoredRepeatRule[] = JSON.parse(jsonStr);
  return storedRepeats.map((rule) => ({
    ...rule,
    start: new Date(rule.start),
  }));
};

// 保存データに無い項目 (あとから増えた項目など) は、はじめの値で補う
const loadPlayer = (): Player => {
  const jsonStr = localStorage.getItem(playerStorageKey);
  if (jsonStr === null) {
    return createPlayer();
  }
  return { ...createPlayer(), ...JSON.parse(jsonStr) };
};

const loadLog = (): LogEntry[] => {
  const jsonStr = localStorage.getItem(logStorageKey);
  return jsonStr === null ? [] : JSON.parse(jsonStr);
};

// 今日から repeatListDays 日分の、繰り返しタスクの回
const getWeekRepeatTodos = (repeats: RepeatRule[]): Todo[] => {
  const today = dayjs().startOf("day");
  return sortByDeadline(
    repeats.flatMap((rule) =>
      getOccurrences(
        rule,
        today.toDate(),
        today.add(repeatListDays, "day").toDate(),
      ),
    ),
  );
};

const sortByDeadline = (todos: Todo[]): Todo[] =>
  [...todos].sort(
    (a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf(),
  );

const getTodoNameError = (name: string): string => {
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 32) {
    return "前後の空白を除いて、2文字以上、32文字以内で入力してください";
  }
  return "";
};

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [repeats, setRepeats] = useState<RepeatRule[]>(loadRepeats);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(1);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [isNameTouched, setIsNameTouched] = useState(false);
  const [newTodoRepeat, setNewTodoRepeat] = useState<RepeatType>("none");
  const [newTodoRepeatDays, setNewTodoRepeatDays] = useState(3); // 「○日ごと」の日数
  // 追加・完了などの操作で始まった場面 (null のときは Todo の状態で決める)
  const [eventScene, setEventScene] = useState<SceneKey | null>(null);
  // 同じ場面が続けて起きても、会話を 1 セリフ目から始め直すための番号
  const [sceneCount, setSceneCount] = useState(0);
  // タイムテーブルに表示する日 (最初は今日の 0 時)
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().startOf("day").toDate(),
  );
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [view, setView] = useState<"timetable" | "calendar">("timetable");

  const [player, setPlayer] = useState<Player>(loadPlayer);
  const [now, setNow] = useState(() => Date.now()); // バフの残り時間などに使う今の日時
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [taskLog, setTaskLog] = useState<LogEntry[]>(loadLog);
  const [isReportOpen, setIsReportOpen] = useState(false);
  // 報酬やダメージを画面下に少しだけ表示する
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);

  // 繰り返しタスクは、今日から 1 週間以内の回だけをやること一覧に出す
  const today = dayjs().startOf("day");
  const weekRepeatTodos = getWeekRepeatTodos(repeats);
  // タイムテーブルとカレンダーには、表示している月の回をすべて出す
  const month = dayjs(selectedDate).startOf("month");
  const monthRepeatTodos = repeats.flatMap((rule) =>
    getOccurrences(rule, month.toDate(), month.add(1, "month").toDate()),
  );
  // 会話の件数や場面は、やること一覧に出ているタスクで数える
  const listedTodos = [...todos, ...weekRepeatTodos];
  const uncompletedCount = listedTodos.filter((todo) => !todo.isDone).length;
  const currentScene = eventScene ?? getStatusScene(listedTodos);
  // 期限のないタスクは「とりあえず後でやる」欄に表示する
  const scheduledTodos = sortByDeadline(
    todos.filter((todo) => todo.deadline !== null),
  );
  const scheduleTodos = [...scheduledTodos, ...monthRepeatTodos];
  const laterTodos = todos.filter((todo) => todo.deadline === null);
  const completedCount = listedTodos.length - uncompletedCount;
  const newTodoNameError = getTodoNameError(newTodoName);
  const isNewTodoNameInvalid = newTodoNameError !== "";
  const showNewTodoNameError = isNameTouched && isNewTodoNameInvalid;
  // 繰り返しは開始日時を基準にするので、開始日時がないと作れない
  const isRepeatInvalid = newTodoRepeat !== "none" && newTodoDeadline === null;
  // 追加フォームで見せる、最初の 3 回分の日時
  const previewDates =
    newTodoRepeat === "none" || newTodoDeadline === null
      ? []
      : getFirstDates(newTodoDeadline, newTodoRepeat, newTodoRepeatDays, 3);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(repeatStorageKey, JSON.stringify(repeats));
  }, [repeats]);

  useEffect(() => {
    localStorage.setItem(playerStorageKey, JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    localStorage.setItem(logStorageKey, JSON.stringify(taskLog));
  }, [taskLog]);

  // 一定の間隔で今の日時を更新する (バフの残り時間や、期限切れの判定のため)
  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(Date.now()),
      damageCheckInterval,
    );
    return () => window.clearInterval(timer);
  }, []);

  // 新しく期限切れになったタスクがあれば、その分のダメージを受ける
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const checkedAt = Date.now();
      const overdue = getNewlyOverdue(
        player,
        [...todos, ...getWeekRepeatTodos(repeats)],
        checkedAt,
      );
      if (overdue.length === 0) {
        return;
      }
      const result = takeDamage(player, overdue, checkedAt);
      setPlayer(result.player);
      // 作業報告書に「期限切れ」として 1 件ずつ記録する
      setTaskLog((currentLog) => [
        ...currentLog,
        ...overdue.map((todo) =>
          createLogEntry(todo, "overdue", checkedAt, {
            damage: getDamageFor(player, todo, checkedAt),
          }),
        ),
      ]);
      // (showToast と playScene の中身と同じ。effect の中では state の更新関数を直接使う)
      setToast({
        text: `期限切れ！ ${result.damage} のダメージ`,
        id: checkedAt,
      });
      setEventScene("damaged");
      setSceneCount((count) => count + 1);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [todos, repeats, player, now]);

  // 報酬やダメージの表示は、少したったら消す
  useEffect(() => {
    if (toast === null) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), toastDuration);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (text: string) => {
    setToast({ text, id: Date.now() });
  };

  const buy = (item: Item) => {
    setPlayer((current) => buyItem(current, item));
  };

  // 使った結果 (HP の変化や、コーヒーで何が起きたか) をショップに返して、会話を選ばせる
  // (ランダムな効果があるので、更新関数ではなく今のプレイヤーから 1 回だけ計算する)
  const use = (item: Item): UseResult => {
    const usedAt = Date.now();
    const result = consumeItem(player, item, usedAt);
    setPlayer(result.player);
    setNow(usedAt);
    return result;
  };

  // 繰り返しの設定のうち、id のものだけを書き換える
  const updateRepeat = (
    id: string,
    update: (rule: RepeatRule) => RepeatRule,
  ) => {
    setRepeats((currentRepeats) =>
      currentRepeats.map((rule) => (rule.id === id ? update(rule) : rule)),
    );
  };

  const updateNewTodoName = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoName(e.target.value);
    setIsNameTouched(true);
  };

  const updateNewTodoPriority = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const playScene = (scene: SceneKey | null) => {
    setEventScene(scene);
    setSceneCount((count) => count + 1);
  };

  const addNewTodo = () => {
    if (isNewTodoNameInvalid) {
      setIsNameTouched(true);
      return;
    }
    if (isRepeatInvalid) {
      return;
    }

    if (newTodoRepeat !== "none" && newTodoDeadline !== null) {
      // 繰り返しのときは、開始日時と間隔だけを保存する (各回はその都度計算する)
      const newRule: RepeatRule = {
        id: uuid(),
        name: newTodoName.trim(),
        priority: newTodoPriority,
        start: newTodoDeadline,
        type: newTodoRepeat,
        customDays: newTodoRepeatDays,
        doneTimes: [],
        skippedTimes: [],
      };
      setRepeats((currentRepeats) => [...currentRepeats, newRule]);
    } else {
      const newTodo: Todo = {
        id: uuid(),
        name: newTodoName.trim(),
        isDone: false,
        priority: newTodoPriority,
        deadline: newTodoDeadline,
      };
      setTodos((currentTodos) => [...currentTodos, newTodo]);
    }
    setNewTodoName("");
    setNewTodoPriority(1);
    setNewTodoDeadline(null);
    setNewTodoRepeat("none");
    setIsNameTouched(false);
    setIsAddFormOpen(false);
    playScene("added");
  };

  const updateIsDone = (id: string, value: boolean) => {
    if (value) {
      const restCount = listedTodos.filter(
        (todo) => !todo.isDone && todo.id !== id,
      ).length;
      // 優先度に応じた経験値と GOLD をもらう (同じタスクでは 1 回だけ)
      const todo = [...listedTodos, ...monthRepeatTodos].find(
        (t) => t.id === id,
      );
      const result =
        todo === undefined ? null : giveReward(player, todo, Date.now());
      // 作業報告書に「完了」として記録する
      if (todo !== undefined) {
        const completedAt = Date.now();
        setTaskLog((currentLog) =>
          recordDone(currentLog, todo, completedAt, {
            exp: result?.exp ?? 0,
            gold: result?.gold ?? 0,
          }),
        );
      }
      if (result !== null && result.exp > 0) {
        setPlayer(result.player);
        showToast(
          result.levelUps > 0
            ? `LV ${result.player.lv} に上がった！ 最大HPが増えた`
            : `${result.exp} EXP と ${result.gold} G を手に入れた`,
        );
      }
      if (result !== null && result.levelUps > 0) {
        playScene("levelUp");
      } else {
        playScene(restCount === 0 ? "allDone" : "completed");
      }
    } else {
      playScene(null);
      // 完了を取り消したら、作業報告書の完了の記録も消す
      setTaskLog((currentLog) => cancelLatestDone(currentLog, id));
    }
    // 繰り返しの回なら、その回の日時を「完了した回」に入れる (外す)
    const occurrence = parseOccurrenceId(id);
    if (occurrence !== null) {
      updateRepeat(occurrence.ruleId, (rule) => ({
        ...rule,
        doneTimes: value
          ? [...rule.doneTimes, occurrence.time]
          : rule.doneTimes.filter((time) => time !== occurrence.time),
      }));
      return;
    }
    setTodos((currentTodos) =>
      currentTodos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, isDone: value };
        } else {
          return todo;
        }
      }),
    );
  };

  const updateTodoDeadline = (id: string, deadline: Date | null) => {
    if (deadline !== null) {
      playScene("scheduled");
    }
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, deadline: deadline } : todo,
      ),
    );
  };

  const removeCompletedTodos = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.isDone));
    // 繰り返しは、完了した回を「削除した回」に移す (繰り返しの設定は残す)
    setRepeats((currentRepeats) =>
      currentRepeats.map((rule) => ({
        ...rule,
        doneTimes: [],
        skippedTimes: [...rule.skippedTimes, ...rule.doneTimes],
      })),
    );
    playScene(null);
  };

  const remove = (id: string) => {
    // 繰り返しの回なら、その回だけを削除する (次の回からは今までどおり)
    const occurrence = parseOccurrenceId(id);
    if (occurrence !== null) {
      updateRepeat(occurrence.ruleId, (rule) => ({
        ...rule,
        skippedTimes: [...rule.skippedTimes, occurrence.time],
      }));
    } else {
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    }
    playScene(null);
  };

  // 繰り返しそのものをやめる (今後の回もすべて消える)
  const stopRepeat = (id: string) => {
    setRepeats((currentRepeats) =>
      currentRepeats.filter((rule) => rule.id !== id),
    );
    playScene(null);
  };

  return (
    <div className="mx-4 mt-6 mb-24 max-w-2xl space-y-4 md:mx-auto">
      {/* 豆を挽きすぎたコーヒーの効果中は、ページの中身をゆらゆら揺らす
          (画面に固定する部品まで揺らすと位置がずれるので、ふつうの中身だけを包む) */}
      <div
        className={twMerge(
          "space-y-4",
          isScreenEffectActive(player, "wobble", now) &&
            "motion-safe:animate-screen-wobble",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h1
            aria-label={title}
            className="flex items-center gap-3 text-3xl tracking-widest"
          >
            <PixelIcon
              pixels={heartIcon}
              className="h-6 w-7 shrink-0 text-ut-red motion-safe:animate-heartbeat"
            />
            {/* 1 文字ずつ少しずつ遅らせて跳ねさせ、波のように見せる */}
            <span aria-hidden="true" className="flex flex-wrap">
              {Array.from(title).map((char, i) => (
                <span
                  key={i}
                  className="inline-block motion-safe:animate-wave"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            <CommandButton
              icon={talkIcon}
              size="sm"
              onClick={() => playScene(null)}
            >
              会話
            </CommandButton>
            <CommandButton
              icon={reportIcon}
              size="sm"
              onClick={() => setIsReportOpen(true)}
            >
              報告書
            </CommandButton>
          </div>
        </div>
        <StatusBar
          player={player}
          now={now}
          onRename={() => setIsRenaming(true)}
          onOpenShop={() => setIsShopOpen(true)}
        />
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
        <div className="flex gap-2">
          <CommandButton
            icon={timetableIcon}
            size="sm"
            onClick={() => setView("timetable")}
            className={twMerge(
              view === "timetable" && "border-ut-yellow text-ut-yellow",
            )}
          >
            タイムテーブル
          </CommandButton>
          <CommandButton
            icon={calendarIcon}
            size="sm"
            onClick={() => setView("calendar")}
            className={twMerge(
              view === "calendar" && "border-ut-yellow text-ut-yellow",
            )}
          >
            カレンダー
          </CommandButton>
        </div>
        {/* タイムテーブルとカレンダーを切り替えたら、ふわっと出す */}
        <div key={view} className="motion-safe:animate-fade-in">
          {view === "timetable" ? (
            <Timetable
              date={selectedDate}
              todos={scheduleTodos}
              updateIsDone={updateIsDone}
            />
          ) : (
            <Calendar
              date={selectedDate}
              todos={scheduleTodos}
              onSelectDay={(day) => {
                setSelectedDate(day);
                setView("timetable");
              }}
              onChangeMonth={setSelectedDate}
            />
          )}
        </div>
      </div>

      <DialogueBox
        key={`${currentScene}-${sceneCount}`}
        patterns={scenes[currentScene]}
        count={uncompletedCount}
      />

      {/* 豆を挽きすぎたコーヒーの効果中は、画面全体に虹色を重ねる (操作のじゃまはしない) */}
      {isScreenEffectActive(player, "rainbow", now) && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-90 bg-[linear-gradient(90deg,#ff0000,#ff9b26,#ffff00,#00ff66,#00aaff,#aa00ff,#ff0000)] bg-size-[200%_100%] opacity-35 mix-blend-color motion-safe:animate-rainbow"
        />
      )}

      {/* 追加ボタンは、ふわふわ浮かせておく (マウスを乗せるとハートがポンと出る) */}
      <button
        type="button"
        onClick={() => setIsAddFormOpen(true)}
        aria-label="タスクを追加"
        className="group fixed right-4 bottom-14 z-10 flex size-14 ut-button items-center justify-center bg-black p-0 motion-safe:animate-float"
      >
        <PixelIcon pixels={plusIcon} className="size-7 group-hover:hidden" />
        <PixelIcon
          pixels={heartIcon}
          className="hidden size-7 text-ut-red group-hover:block motion-safe:group-hover:animate-pop"
        />
      </button>

      <BottomSheet title="やること一覧">
        <h2 className="mb-2 text-lg">
          <Star /> 今週の繰り返しタスク
          <span className="ml-2 text-sm text-gray-400">
            ({today.format("M/D")} 〜{" "}
            {today.add(repeatListDays - 1, "day").format("M/D")})
          </span>
        </h2>
        <TodoList
          todos={weekRepeatTodos}
          updateIsDone={updateIsDone}
          updateDeadline={updateTodoDeadline}
          remove={remove}
          emptyMessage="今週の繰り返しタスクはありません。"
        />
        {repeats.length > 0 && (
          <div className="mt-3 space-y-1 border-2 border-gray-700 p-2 text-sm">
            <div className="text-gray-400">繰り返しの設定</div>
            {repeats.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="min-w-0 wrap-anywhere">
                  {rule.name}
                  <span className="ml-2 text-ut-orange">
                    {getRepeatLabel(rule.type, rule.customDays)}
                  </span>
                  <span className="ml-2 text-gray-400">
                    {formatDeadline(rule.start)} から
                  </span>
                </span>
                <CommandButton
                  icon={trashIcon}
                  size="sm"
                  onClick={() => stopRepeat(rule.id)}
                  aria-label={`${rule.name}の繰り返しをやめる`}
                >
                  繰り返しをやめる
                </CommandButton>
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-6 mb-2 text-lg">
          <Star /> 日時が決まっているタスク
        </h2>
        <TodoList
          todos={scheduledTodos}
          updateIsDone={updateIsDone}
          updateDeadline={updateTodoDeadline}
          remove={remove}
          emptyMessage="日時が決まっているタスクはありません。"
        />

        <h2 className="mt-6 mb-2 text-lg">
          <Star /> とりあえず後でやる
        </h2>
        <TodoList
          todos={laterTodos}
          updateIsDone={updateIsDone}
          updateDeadline={updateTodoDeadline}
          remove={remove}
          emptyMessage="後回しのタスクはありません。"
        />

        <CommandButton
          icon={broomIcon}
          onClick={removeCompletedTodos}
          disabled={completedCount === 0}
          className="mt-4"
        >
          完了済みのタスクを削除
        </CommandButton>
      </BottomSheet>

      {isAddFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 motion-safe:animate-fade-in"
            onClick={() => setIsAddFormOpen(false)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addNewTodo();
            }}
            aria-labelledby="newTodoHeading"
            className="relative w-full max-w-xl space-y-3 ut-box p-4 motion-safe:animate-pop-in"
          >
            <div className="flex items-center justify-between">
              <h2 id="newTodoHeading" className="text-lg">
                <Star /> 新しいタスクの追加
              </h2>
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                aria-label="閉じる"
                className="cursor-pointer px-2 text-xl text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <label className="text-ut-yellow" htmlFor="newTodoName">
                  名前
                </label>
                <input
                  id="newTodoName"
                  name="todoName"
                  type="text"
                  required
                  autoFocus
                  value={newTodoName}
                  onChange={updateNewTodoName}
                  aria-invalid={showNewTodoNameError}
                  aria-describedby={
                    showNewTodoNameError ? "newTodoNameError" : undefined
                  }
                  className={twMerge(
                    "min-w-0 grow ut-input p-2",
                    showNewTodoNameError && "border-ut-red outline-ut-red",
                  )}
                  placeholder="2文字以上、32文字以内で入力してください"
                />
              </div>
              {showNewTodoNameError && (
                <div
                  id="newTodoNameError"
                  aria-live="polite"
                  className="mt-1 ml-10 flex items-center space-x-1 text-sm text-ut-red"
                >
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="mr-0.5"
                  />
                  <div>{newTodoNameError}</div>
                </div>
              )}
            </div>

            <fieldset>
              <legend className="mb-1 text-ut-yellow">優先度</legend>
              <div className="flex gap-5">
                {[1, 2, 3].map((value) => (
                  <label key={value} className="flex items-center space-x-1">
                    <input
                      id={`priority-${value}`}
                      name="priorityGroup"
                      type="radio"
                      value={value}
                      checked={newTodoPriority === value}
                      onChange={updateNewTodoPriority}
                      className="accent-ut-yellow"
                    />
                    <span>
                      {value} ({priorityLabels[value]})
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1">
              <div className="text-ut-yellow">
                {newTodoRepeat === "none" ? "期限" : "開始"}
              </div>
              <DeadlineInput
                id="deadline"
                label={newTodoRepeat === "none" ? "期限" : "開始"}
                decideLabel={
                  newTodoRepeat === "none" ? "期限を決める" : "開始日を決める"
                }
                value={newTodoDeadline}
                onChange={setNewTodoDeadline}
              />
              {newTodoRepeat === "none" && newTodoDeadline === null && (
                <div className="text-sm text-gray-400">
                  期限を決めなければ「とりあえず後でやる」に入ります
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-ut-yellow" htmlFor="repeat">
                  繰り返し
                </label>
                <select
                  id="repeat"
                  value={newTodoRepeat}
                  onChange={(e) =>
                    setNewTodoRepeat(e.target.value as RepeatType)
                  }
                  className="ut-input py-0.5"
                >
                  {repeatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {newTodoRepeat === "custom" && (
                  <label className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={newTodoRepeatDays}
                      onChange={(e) =>
                        setNewTodoRepeatDays(
                          Math.min(365, Math.max(1, Number(e.target.value))),
                        )
                      }
                      className="w-16 ut-input py-0.5"
                    />
                    日ごと
                  </label>
                )}
              </div>
              {isRepeatInvalid && (
                <div className="flex items-center gap-1 text-sm text-ut-red">
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  繰り返すときは、開始日時を入力してください
                </div>
              )}
              {previewDates.length > 0 && (
                <div className="text-sm text-gray-400">
                  <Star />{" "}
                  {previewDates
                    .map((date) => formatDeadline(date, "M/D"))
                    .join("、")}{" "}
                  …… とスケジュールに入ります。
                  <br />
                  今日から1週間以内の回は「今週の繰り返しタスク」に入ります
                </div>
              )}
            </div>

            <CommandButton
              icon={plusIcon}
              type="submit"
              disabled={isNewTodoNameInvalid || isRepeatInvalid}
            >
              追加
            </CommandButton>
          </form>
        </div>
      )}

      {toast !== null && (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 ut-box px-4 py-2 whitespace-nowrap text-ut-yellow motion-safe:animate-pop-in"
        >
          <Star /> {toast.text}
        </div>
      )}

      {isShopOpen && (
        <Shop
          player={player}
          onBuy={buy}
          onUse={use}
          now={now}
          onClose={() => setIsShopOpen(false)}
        />
      )}

      {(player.name === "" || isRenaming) && (
        <NameEntry
          initialName={player.name}
          onDecide={(name) => {
            setPlayer((current) => ({ ...current, name }));
            setIsRenaming(false);
          }}
        />
      )}

      {isReportOpen && (
        <WorkReport
          log={taskLog}
          playerName={player.name}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {player.hp <= 0 && (
        <GameOver
          playerName={player.name}
          gold={player.gold}
          onRevive={() => setPlayer((current) => revive(current))}
        />
      )}
    </div>
  );
};

export default App;
