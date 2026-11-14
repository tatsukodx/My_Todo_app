import dayjs from "dayjs";
import { endOfDay, formatDeadline, isAllDay } from "./deadline";
import WheelPicker from "./WheelPicker";
import type { WheelItem } from "./WheelPicker";

type Props = {
  id: string; // 「期限を決める」チェックの id (ラベルの htmlFor と合わせる)
  value: Date | null;
  onChange: (value: Date | null) => void;
  label: string; // 読み上げ用の名前 (例: 「期限」)
  decideLabel?: string; // 指定すると「期限を決める」のチェックを出し、外すと期限なしにできる
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const minuteStep = 5; // 分は 5 分ごとに選ぶ

type Time = { hour: number; minute: number };

// 年・月・日 (と時刻) から期限を作る。時刻がなければその日中 (23:59:59) にする
// (月を変えて、その月にない日 (例: 2月30日) になったときは月末に合わせる)
const makeDeadline = (
  year: number,
  month: number,
  day: number,
  time: Time | null,
): Date => {
  const daysInMonth = dayjs(new Date(year, month, 1)).daysInMonth();
  const date = new Date(year, month, Math.min(day, daysInMonth));
  return time === null
    ? endOfDay(date)
    : dayjs(date).hour(time.hour).minute(time.minute).toDate();
};

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

// 期限の入力欄。日付はカレンダーから選び、
// 「時間を指定する」にチェックを入れたときだけ、時・分を上下スクロールのホイールで選べる
// (入れなければその日中まで)
const DeadlineInput = (props: Props) => {
  const now = dayjs();
  // 期限がまだないときは、今日をホイールに出しておく
  const base = props.value === null ? now.startOf("day") : dayjs(props.value);
  const hasDeadline = props.value !== null;
  const time: Time | null =
    props.value !== null && !isAllDay(props.value)
      ? { hour: base.hour(), minute: base.minute() }
      : null;

  const change = (
    parts: { year?: number; month?: number; day?: number },
    newTime: Time | null = time,
  ) => {
    props.onChange(
      makeDeadline(
        parts.year ?? base.year(),
        parts.month ?? base.month(),
        parts.day ?? base.date(),
        newTime,
      ),
    );
  };

  const hourItems: WheelItem[] = range(0, 23).map((hour) => ({
    value: hour,
    label: `${hour}時`,
  }));
  // 5 分刻み。前に保存した期限の分が刻みに合わないときは、その分も選べるようにする
  const minutes = range(0, Math.floor(59 / minuteStep)).map(
    (i) => i * minuteStep,
  );
  if (time !== null && !minutes.includes(time.minute)) {
    minutes.push(time.minute);
    minutes.sort((a, b) => a - b);
  }
  const minuteItems: WheelItem[] = minutes.map((minute) => ({
    value: minute,
    label: `${String(minute).padStart(2, "0")}分`,
  }));

  // 時間を指定し始めたときの時刻は、今の次のちょうどの時刻 (例: 14:20 なら 15:00)
  const defaultTime: Time = { hour: Math.min(now.hour() + 1, 23), minute: 0 };

  return (
    <div className="space-y-2">
      {props.decideLabel !== undefined && (
        <label className="flex w-fit cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            id={props.id}
            checked={hasDeadline}
            onChange={(e) =>
              props.onChange(e.target.checked ? endOfDay(now.toDate()) : null)
            }
            className="size-4 cursor-pointer accent-ut-yellow"
          />
          {props.decideLabel}
        </label>
      )}

      {(hasDeadline || props.decideLabel === undefined) && (
        <>
          <div className="flex flex-wrap items-start gap-3">
            {/* 日付はカレンダーから選ぶ (空にはできないので、消されたときは何もしない) */}
            <input
              type="date"
              aria-label={`${props.label}の日付`}
              value={base.format("YYYY-MM-DD")}
              onChange={(e) => {
                if (e.target.value === "") {
                  return;
                }
                const picked = dayjs(e.target.value);
                change({
                  year: picked.year(),
                  month: picked.month(),
                  day: picked.date(),
                });
              }}
              className="max-w-full min-w-0 ut-input py-0.5"
            />
            <div className="space-y-1">
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={time !== null}
                  onChange={(e) =>
                    change({}, e.target.checked ? defaultTime : null)
                  }
                  className="size-4 cursor-pointer accent-ut-yellow"
                />
                時間を指定する
              </label>
              {time !== null && (
                <div className="flex gap-1">
                  <WheelPicker
                    label={`${props.label}の時`}
                    items={hourItems}
                    value={time.hour}
                    onChange={(hour) => change({}, { ...time, hour })}
                    className="w-14"
                  />
                  <WheelPicker
                    label={`${props.label}の分`}
                    items={minuteItems}
                    value={time.minute}
                    onChange={(minute) => change({}, { ...time, minute })}
                    className="w-14"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-ut-yellow">
            ＊{" "}
            {time === null
              ? `${base.format("YYYY/MM/DD")}(${weekdays[base.day()]}) の、その日中まで`
              : formatDeadline(
                  makeDeadline(base.year(), base.month(), base.date(), time),
                )}
          </div>
        </>
      )}
    </div>
  );
};

export default DeadlineInput;
