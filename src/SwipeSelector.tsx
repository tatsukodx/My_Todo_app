import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export type SelectorItem = {
  value: number;
  label: string;
  subLabel?: string;
};

type Props = {
  label: string;
  items: SelectorItem[];
  value: number;
  onChange: (value: number) => void;
};

// 横にスワイプ (スクロール) して、中央に来た項目を選ぶ欄
const SwipeSelector = (props: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  // スライド中に枠の中にある項目 (スライドしていないときは null)
  const [scrollingValue, setScrollingValue] = useState<number | null>(null);

  // 選ばれている項目が中央に来るようにスクロールする
  // (アニメーションさせると途中で下の handleScroll が別の項目を選んでしまうため、一瞬で移動する)
  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>(
      `[data-value="${props.value}"]`,
    );
    if (!list || !selected) {
      return;
    }
    list.scrollTo({
      left: selected.offsetLeft - (list.clientWidth - selected.offsetWidth) / 2,
      behavior: "instant",
    });
  }, [props.value, props.items.length]);

  // 今、中央の枠に一番近い項目の値を返す
  const findCenterValue = (): number => {
    const list = listRef.current;
    if (!list) {
      return props.value;
    }
    const center = list.scrollLeft + list.clientWidth / 2;
    let nearestValue = props.value;
    let nearestDistance = Infinity;
    list.querySelectorAll<HTMLElement>("[data-value]").forEach((item) => {
      const distance = Math.abs(
        item.offsetLeft + item.offsetWidth / 2 - center,
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
    setScrollingValue(findCenterValue());
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
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 text-sm text-gray-400">{props.label}</span>
      <div className="relative min-w-0 grow">
        {/* 中央に固定した選択枠。項目はこの下をスライドしていく */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-14 -translate-x-1/2 border-2 border-ut-yellow" />
        <div
          ref={listRef}
          onScroll={handleScroll}
          role="listbox"
          aria-label={props.label}
          className="relative no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-1.75rem)] py-1"
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
                "flex w-14 shrink-0 cursor-pointer snap-center flex-col items-center py-0.5 text-gray-500",
                item.value === highlightValue && "text-ut-yellow",
              )}
            >
              {/* 枠の中の (選ばれている) 文字は、ゆらゆら揺らす */}
              <span
                className={twMerge(
                  "flex flex-col items-center",
                  item.value === highlightValue && "motion-safe:animate-wobble",
                )}
              >
                <span>{item.label}</span>
                {item.subLabel && (
                  <span className="text-xs">{item.subLabel}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeSelector;
