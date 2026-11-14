import { useState } from "react";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import type { LogEntry, LogSummary } from "./taskLog";
import { getMonthLog, summarizeLog } from "./taskLog";
import Star from "./Star";
import { formatDeadline } from "./deadline";
import { priorityLabels, priorityStars } from "./priority";

type Props = {
  log: LogEntry[];
  playerName: string;
  onClose: () => void;
};

// 記録の「結果」の欄に出す文字と色
const getResult = (entry: LogEntry): { label: string; className: string } => {
  if (entry.type === "overdue") {
    return { label: "期限切れ", className: "border-ut-red text-ut-red" };
  }
  if (entry.onTime === null) {
    return { label: "期限なし", className: "border-gray-500 text-gray-400" };
  }
  return entry.onTime
    ? { label: "期限内", className: "border-ut-yellow text-ut-yellow" }
    : { label: "遅れて完了", className: "border-ut-orange text-ut-orange" };
};

// 期限内に終えた割合に合わせた、二人のひとこと
const getComment = (summary: LogSummary): { speaker: string; text: string } => {
  if (summary.doneCount === 0 && summary.overdueCount === 0) {
    return {
      speaker: "サンズ",
      text: "この月はまだ真っ白だな。オイラの予定表といっしょだ",
    };
  }
  if (summary.onTimeRate === null || summary.onTimeRate >= 80) {
    return {
      speaker: "ガスター",
      text: "ふむ。実に優秀な報告書だね。研究所に飾っておこう。",
    };
  }
  if (summary.onTimeRate >= 50) {
    return {
      speaker: "サンズ",
      text: "まずまずだな。ハカセの論文の進みよりはずっといいぜ",
    };
  }
  return {
    speaker: "ガスター",
    text: "……ふむ。来月は、期限という概念から一緒に学ぼうか。",
  };
};

// これまでに完了した (期限切れになった) タスクの記録を、月ごとに見る画面
const WorkReport = (props: Props) => {
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const monthLog = getMonthLog(props.log, month.toDate());
  const summary = summarizeLog(monthLog);
  const comment = getComment(summary);

  const stats = [
    { label: "完了", value: `${summary.doneCount}件` },
    { label: "期限内", value: `${summary.onTimeCount}件` },
    { label: "遅れて完了", value: `${summary.lateCount}件` },
    { label: "期限切れ", value: `${summary.overdueCount}件` },
    {
      label: "期限内の割合",
      value: summary.onTimeRate === null ? "－" : `${summary.onTimeRate}%`,
    },
    { label: "獲得", value: `${summary.exp} EXP / ${summary.gold} G` },
    { label: "受けたダメージ", value: `${summary.damage}` },
  ];

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black motion-safe:animate-fade-in">
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl tracking-widest">
            <Star /> 作業報告書
          </h2>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="作業報告書をとじる"
            className="cursor-pointer px-2 text-2xl text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400">
          <span>報告者：{props.playerName}</span>
          <span>提出先：ガスター研究室</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setMonth(month.subtract(1, "month"))}
            aria-label="前の月"
            className="cursor-pointer px-2 text-ut-orange hover:text-ut-yellow"
          >
            ◀
          </button>
          <span className="text-xl">{month.format("YYYY年M月")}</span>
          <button
            type="button"
            onClick={() => setMonth(month.add(1, "month"))}
            aria-label="次の月"
            className="cursor-pointer px-2 text-ut-orange hover:text-ut-yellow"
          >
            ▶
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-2 ut-box p-3 text-sm sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-gray-400">{stat.label}</dt>
              <dd className="text-lg">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <p className="border-2 border-gray-700 p-3">
          <span className="text-ut-yellow">{comment.speaker}</span>
          <br />
          <Star /> {comment.text}
        </p>

        {monthLog.length === 0 ? (
          <p className="text-gray-500">
            <Star /> この月の記録はありません
          </p>
        ) : (
          <ul className="space-y-2">
            {monthLog.map((entry) => {
              const result = getResult(entry);
              return (
                <li
                  key={entry.id}
                  className="ut-box p-3 motion-safe:animate-enter"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={twMerge(
                        "shrink-0 border px-1.5 text-xs",
                        result.className,
                      )}
                    >
                      {result.label}
                    </span>
                    <span className="min-w-0 grow text-lg wrap-anywhere">
                      {entry.name}
                    </span>
                    {entry.isRepeat && (
                      <span className="text-xs text-ut-orange">くり返し</span>
                    )}
                  </div>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-sm text-gray-400">
                    <dt>{entry.type === "done" ? "完了日" : "期限切れ"}</dt>
                    <dd>
                      {dayjs(entry.recordedAt).format("YYYY/MM/DD HH:mm")}
                    </dd>
                    <dt>期限</dt>
                    <dd>
                      {entry.deadline === null
                        ? "なし"
                        : formatDeadline(new Date(entry.deadline))}
                    </dd>
                    <dt>優先度</dt>
                    <dd>
                      {priorityLabels[entry.priority] ?? entry.priority}
                      <span className="ml-1 text-ut-yellow">
                        {priorityStars(entry.priority)}
                      </span>
                    </dd>
                    <dt>{entry.type === "done" ? "報酬" : "ダメージ"}</dt>
                    <dd>
                      {entry.type === "done"
                        ? entry.exp > 0
                          ? `${entry.exp} EXP / ${entry.gold} G`
                          : "なし (受け取り済み)"
                        : `${entry.damage}`}
                    </dd>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WorkReport;
