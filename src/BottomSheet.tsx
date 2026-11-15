import { useRef, useState } from "react";
import type { ReactNode, PointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import { playSpear } from "./sound";

type Props = {
  title: string;
  children: ReactNode;
};

// 画面下の出っ張りをクリック、または上にスワイプすると下から出てくるシート
const BottomSheet = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  // スワイプを始めた位置と、直前の操作がスワイプだったか (クリック扱いしないため)
  const startYRef = useRef<number | null>(null);
  const isSwipedRef = useRef(false);

  // 開くときは槍が出てくる音、閉じるときはその逆再生を鳴らす
  const changeOpen = (open: boolean) => {
    if (open !== isOpen) {
      playSpear(!open);
    }
    setIsOpen(open);
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    startYRef.current = e.clientY;
    isSwipedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (startYRef.current === null) {
      return;
    }
    const moveY = e.clientY - startYRef.current;
    startYRef.current = null;
    if (moveY < -30) {
      changeOpen(true);
      isSwipedRef.current = true;
    } else if (moveY > 30) {
      changeOpen(false);
      isSwipedRef.current = true;
    }
  };

  const handleClick = () => {
    if (isSwipedRef.current) {
      isSwipedRef.current = false;
      return;
    }
    changeOpen(!isOpen);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60"
          onClick={() => changeOpen(false)}
        />
      )}
      <div
        className={twMerge(
          "fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-2xl flex-col transition-transform duration-300",
          isOpen ? "translate-y-0" : "translate-y-[calc(100%-2.75rem)]",
        )}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          data-silent
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
          className="relative z-10 mx-auto -mb-1 flex h-11 w-56 cursor-pointer touch-none items-center justify-center gap-2 border-4 border-b-0 border-white bg-black"
        >
          {/* 閉じているときは、上に引き出せることが分かるよう矢印を弾ませる */}
          <span
            className={twMerge(
              "text-ut-yellow",
              !isOpen && "motion-safe:animate-nudge-up",
            )}
          >
            {isOpen ? "▼" : "▲"}
          </span>
          {props.title}
        </button>
        <div className="h-[70vh] overflow-y-auto border-4 border-b-0 border-white bg-black p-4">
          {props.children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
