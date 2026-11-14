import Star from "./Star";
import dayjs from "dayjs";
import SwipeSelector from "./SwipeSelector";
import type { SelectorItem } from "./SwipeSelector";
import CommandButton from "./CommandButton";
import { calendarIcon } from "./pixelIcons";

type Props = {
  date: Date;
  onChange: (date: Date) => void;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

// 年・月を変えたときに、その月にない日 (例: 2月30日) にならないよう月末に合わせる
const makeDate = (year: number, month: number, day: number): Date => {
  const daysInMonth = dayjs(new Date(year, month, 1)).daysInMonth();
  return new Date(year, month, Math.min(day, daysInMonth));
};

const DateSelector = (props: Props) => {
  const current = dayjs(props.date);
  const thisYear = new Date().getFullYear();

  const yearItems: SelectorItem[] = [];
  for (let y = thisYear - 1; y <= thisYear + 4; y++) {
    yearItems.push({ value: y, label: `${y}` });
  }

  const monthItems: SelectorItem[] = [];
  for (let m = 0; m < 12; m++) {
    monthItems.push({ value: m, label: `${m + 1}月` });
  }

  const dayItems: SelectorItem[] = [];
  for (let d = 1; d <= current.daysInMonth(); d++) {
    const weekday = new Date(current.year(), current.month(), d).getDay();
    dayItems.push({ value: d, label: `${d}`, subLabel: weekdays[weekday] });
  }

  return (
    <div className="space-y-1 ut-box p-2">
      <div className="flex items-center justify-between px-1">
        <span>
          <Star /> {current.format("YYYY年M月D日")} ({weekdays[current.day()]})
        </span>
        <CommandButton
          icon={calendarIcon}
          size="sm"
          onClick={() => props.onChange(dayjs().startOf("day").toDate())}
        >
          今日
        </CommandButton>
      </div>
      <SwipeSelector
        label="年"
        items={yearItems}
        value={current.year()}
        onChange={(year) =>
          props.onChange(makeDate(year, current.month(), current.date()))
        }
      />
      <SwipeSelector
        label="月"
        items={monthItems}
        value={current.month()}
        onChange={(month) =>
          props.onChange(makeDate(current.year(), month, current.date()))
        }
      />
      <SwipeSelector
        label="日"
        items={dayItems}
        value={current.date()}
        onChange={(day) =>
          props.onChange(makeDate(current.year(), current.month(), day))
        }
      />
    </div>
  );
};

export default DateSelector;
