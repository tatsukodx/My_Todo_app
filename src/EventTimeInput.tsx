import dayjs from "dayjs";
import WheelPicker from "./WheelPicker";
import type { WheelItem } from "./WheelPicker";
import type { TodoEvent } from "./types";
import { isEventTimeValid } from "./scheduleEvent";

type Props = {
  value: TodoEvent;
  onChange: (value: TodoEvent) => void;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const minuteStep = 5;

const hourItems: WheelItem[] = [...Array(24).keys()].map((hour) => ({
  value: hour,
  label: `${hour}時`,
}));
const minuteItems: WheelItem[] = [...Array(60 / minuteStep).keys()].map(
  (i) => ({
    value: i * minuteStep,
    label: `${String(i * minuteStep).padStart(2, "0")}分`,
  }),
);

// 予定の日付と、何時から何時までかを決める入力欄
const EventTimeInput = (props: Props) => {
  const start = dayjs(props.value.start);
  const end = dayjs(props.value.end);

  // 日付を変えたら、始まりと終わりの時刻はそのままで日付だけ動かす
  const changeDate = (value: string) => {
    if (value === "") {
      return;
    }
    const day = dayjs(value);
    const moveTo = (time: dayjs.Dayjs) =>
      day.hour(time.hour()).minute(time.minute()).toDate();
    props.onChange({ start: moveTo(start), end: moveTo(end) });
  };

  const changeTime = (
    which: "start" | "end",
    part: "hour" | "minute",
    value: number,
  ) => {
    const changed = (which === "start" ? start : end)[part](value).toDate();
    props.onChange({ ...props.value, [which]: changed });
  };

  // 時・分のホイールを 1 組並べる
  const renderTime = (which: "start" | "end", label: string) => {
    const time = which === "start" ? start : end;
    return (
      <div className="space-y-1">
        <div className="text-sm">{label}</div>
        <div className="flex gap-1">
          <WheelPicker
            label={`${label}の時`}
            items={hourItems}
            value={time.hour()}
            onChange={(hour) => changeTime(which, "hour", hour)}
            className="w-14"
          />
          <WheelPicker
            label={`${label}の分`}
            items={minuteItems}
            value={time.minute() - (time.minute() % minuteStep)}
            onChange={(minute) => changeTime(which, "minute", minute)}
            className="w-14"
          />
        </div>
      </div>
    );
  };

  const isValid = isEventTimeValid(props.value);

  return (
    <div className="space-y-2">
      <input
        type="date"
        aria-label="予定の日付"
        value={start.format("YYYY-MM-DD")}
        onChange={(e) => changeDate(e.target.value)}
        className="max-w-full min-w-0 ut-input py-0.5"
      />
      <div className="flex flex-wrap items-end gap-3">
        {renderTime("start", "始まり")}
        <div className="pb-10 text-gray-400">〜</div>
        {renderTime("end", "終わり")}
      </div>
      <div
        className={isValid ? "text-sm text-ut-yellow" : "text-sm text-ut-red"}
      >
        ＊{" "}
        {isValid
          ? `${start.format("YYYY/MM/DD")}(${weekdays[start.day()]}) ${start.format("HH:mm")}〜${end.format("HH:mm")}`
          : "終わりの時刻は、始まりより後にしてください"}
      </div>
    </div>
  );
};

export default EventTimeInput;
