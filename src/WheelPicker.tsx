import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { playSound } from "./sound";

export type WheelItem = {
  value: number;
  label: string;
};

type Props = {
  label: string; // 読み上げ用の名前 (例: 「年」)
  items: WheelItem[];
  value: number;
  onChange: (value: number) => void;
  className?: string; // 幅などを変えたいときに指定する
};

// 上下にスクロール (マウスのホイールや指でのスワイプ) して、真ん中の枠に来た項目を選ぶ欄
// (横スワイプの SwipeSelector を縦にしたもの)
const WheelPicker = (props: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  // スクロール中に枠の中にある項目 (スクロールしていないときは null)
  const [scrollingValue, setScrollingValue] = useState<number | null>(null);

  // 選ばれている項目が真ん中の枠に来るようにスクロールする
  // (アニメーションさせると途中で別の項目が選ばれてしまうので、一瞬で移動する)
  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>(
      `[data-value="${props.value}"]`,
    );
    if (!list || !selected) {
      return;
    }
    list.scrollTo({
      top: selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2,
      behavior: "instant",
    });
  }, [props.value, props.items.length]);

  // 今、真ん中の枠に一番近い項目の値を返す
  const findCenterValue = (): number => {
    const list = listRef.current;
    if (!list) {
      return props.value;
    }
    const center = list.scrollTop + list.clientHeight / 2;
    let nearestValue = props.value;
    let nearestDistance = Infinity;
    list.querySelectorAll<HTMLElement>("[data-value]").forEach((item) => {
      const distance = Math.abs(
        item.offsetTop + item.offsetHeight / 2 - center,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestValue = Number(item.dataset.value);
      }
    });
    return nearestValue;
  };

  // スクロール中は枠の中の項目を光らせ、止まったらその項目を選ぶ
  const handleScroll = () => {
    const centerValue = findCenterValue();
    // 枠の中の項目が変わるたびに、選択が動く音を鳴らす
    if (centerValue !== (scrollingValue ?? props.value)) {
      playSound("move");
    }
    setScrollingValue(centerValue);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const centerValue = findCenterValue();
      setScrollingValue(null);
      if (centerValue !== props.value) {
        props.onChange(centerValue);
      }
    }, 150);
  };

  const highlightValue = scrollingValue ?? props.value;

  return (
    <div className={twMerge("relative h-24 w-16 shrink-0", props.className)}>
      {/* 真ん中に固定した選択枠。項目はこの中を上下に流れていく */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 border-y-2 border-ut-yellow" />
      <div
        ref={listRef}
        onScroll={handleScroll}
        role="listbox"
        aria-label={props.label}
        className="relative no-scrollbar h-full snap-y snap-mandatory overflow-y-auto border-2 border-gray-700 py-8"
      >
        {props.items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="option"
            aria-selected={item.value === props.value}
            data-value={item.value}
            onClick={() => props.onChange(item.value)}
            className={twMerge(
              "flex h-8 w-full cursor-pointer snap-center items-center justify-center text-gray-500",
              item.value === highlightValue && "text-ut-yellow",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WheelPicker;
