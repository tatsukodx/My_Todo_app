import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import PixelIcon from "./PixelIcon";
import { heartIcon } from "./pixelIcons";
import { playSound } from "./sound";
import type { PixelGrid } from "./pixelIcons";

type Props = {
  icon: PixelGrid;
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  size?: "md" | "sm";
  className?: string;
  "aria-label"?: string;
  "aria-expanded"?: boolean; // 押すと何かが開くボタンのとき、開いているか
};

// 戦闘画面のコマンドのようなボタン。選ぶ (マウスを乗せる・フォーカスする) と
// 黄色になり、アイコンが赤いハートに変わる
const CommandButton = (props: Props) => {
  const iconSize = props.size === "sm" ? "size-3.5" : "size-5";

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      // ハートが移ってくるときに、選択が動く音を鳴らす
      onMouseEnter={() => {
        if (!props.disabled) {
          playSound("move");
        }
      }}
      disabled={props.disabled}
      aria-label={props["aria-label"]}
      aria-expanded={props["aria-expanded"]}
      className={twMerge(
        "group flex shrink-0 ut-button items-center gap-2 font-bold tracking-wider",
        "focus-visible:border-ut-yellow focus-visible:text-ut-yellow focus-visible:outline-none",
        props.size === "sm" ? "gap-1 px-2 py-0.5 text-sm" : "px-3 py-1 text-lg",
        props.className,
      )}
    >
      <PixelIcon
        pixels={props.icon}
        className={twMerge(
          iconSize,
          "group-focus-visible:hidden group-enabled:group-hover:hidden",
        )}
      />
      <PixelIcon
        pixels={heartIcon}
        className={twMerge(
          iconSize,
          "hidden text-ut-red group-focus-visible:block group-enabled:group-hover:block",
          // ハートが出るときに、ポンと弾けるように出す
          "motion-safe:group-focus-visible:animate-pop motion-safe:group-enabled:group-hover:animate-pop",
        )}
      />
      {props.children}
    </button>
  );
};

export default CommandButton;
