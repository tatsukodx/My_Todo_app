import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  className?: string;
  duration?: number; // 高さを変えるのにかける時間 (ミリ秒)
  // 伸び縮みの間、はみ出した部分を隠すか (はじめは隠す)
  // 中に自分で伸び縮みする枠があるときは、外側で隠すと枠が切れて見えるので false にする
  clip?: boolean;
};

// 中身の高さが変わったとき (セリフが長くて行が増えた、カレンダーの週が増えた など)、
// カクッと変わらず、滑らかに伸び縮みさせる入れ物
// (CSS は height: auto への変化をアニメーションできないので、中身の高さを測って px で指定する)
const SmoothHeight = (props: Props) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  // 伸び縮みしている間だけ、はみ出した部分を隠す
  // (ずっと隠すと、フォーカスの枠やアニメーションが切れてしまうため)
  const [isAnimating, setIsAnimating] = useState(false);

  const duration = props.duration ?? 250;

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (inner === null) {
      return;
    }
    let lastHeight: number | null = null;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      const next = inner.offsetHeight;
      if (next === lastHeight) {
        return;
      }
      // 2 回目からの変化だけ、伸び縮みの間はみ出しを隠す
      if (lastHeight !== null) {
        setIsAnimating(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setIsAnimating(false), duration + 50);
      }
      lastHeight = next;
      setHeight(next);
    });
    observer.observe(inner);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [duration]);

  return (
    <div
      className={twMerge(
        // 動きを減らす設定のときは、伸び縮みさせずにすぐ変える
        "transition-[height] ease-out motion-reduce:transition-none",
        isAnimating && (props.clip ?? true) && "overflow-hidden",
        props.className,
      )}
      style={{
        // 最初に測るまでは、ふつうの高さ (auto) のまま
        height: height ?? undefined,
        transitionDuration: `${duration}ms`,
      }}
    >
      {/* flow-root にして、中の余白 (margin) が外にはみ出して測り間違えないようにする */}
      <div ref={innerRef} className="flow-root">
        {props.children}
      </div>
    </div>
  );
};

export default SmoothHeight;
