import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import PixelIcon from "./PixelIcon";
import { heartIcon } from "./pixelIcons";
import { preloadAll, preloadCount } from "./preload";
import { playSound } from "./sound";

type Props = {
  onStart: () => void;
  // 前に一度読み込めているとき。読み込みバーは出さず、すぐ「はじめる」を待つ
  // (画像や音声はブラウザに残っているので、裏で読み直すだけにする)
  isQuick?: boolean;
};

const minShowTime = 1200; // 読み込みが速くても、一瞬で消えないよう最低これだけは見せる
const fadeOutTime = 500;

// 読み込み中に、下にひとこと出しておく (どれか 1 つをランダムに)
const loadingLines = [
  "ハカセが装置を温めている…",
  "サンズがホットドッグを温めている…",
  "コーヒーを淹れている…",
  "研究所の明かりをつけている…",
  "サンズを起こしている…",
  "シメキリを数えている…",
];

// ページを開いたときの、画像と音声の読み込み画面
// 読み込み終わったら「はじめる」を待つ (ここで画面を押すと、音も鳴らせるようになる)
// ブラウザは画面を一度押すまで音を鳴らさせてくれないので、2 回目以降も「はじめる」は毎回出す
const LoadingScreen = (props: Props) => {
  const [done, setDone] = useState(0);
  const [isLoaded, setIsLoaded] = useState(props.isQuick ?? false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [line] = useState(
    () => loadingLines[Math.floor(Math.random() * loadingLines.length)],
  );
  const percent = Math.round((done / preloadCount) * 100);

  useEffect(() => {
    let isCanceled = false;
    const wait = new Promise((resolve) => setTimeout(resolve, minShowTime));
    void Promise.all([
      preloadAll((count) => {
        if (!isCanceled) {
          setDone(count);
        }
      }),
      wait,
    ]).then(() => {
      if (!isCanceled) {
        setIsLoaded(true);
      }
    });
    return () => {
      isCanceled = true;
    };
  }, []);

  const start = () => {
    if (!isLoaded || isLeaving) {
      return;
    }
    playSound("select");
    setIsLeaving(true);
    window.setTimeout(props.onStart, fadeOutTime);
  };

  // キーボードでも始められるようにする
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "z") {
        start();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isLoaded ? "はじめる" : `読み込み中 ${percent}%`}
      onClick={start}
      className={twMerge(
        "fixed inset-0 z-[95] flex cursor-pointer flex-col items-center justify-center gap-6 bg-black px-4 font-pixel text-white transition-opacity duration-500 select-none",
        isLeaving && "opacity-0",
      )}
    >
      <h1 className="text-center text-2xl tracking-widest sm:text-3xl">
        ガスター研究室の
        <br className="sm:hidden" />
        スケジュール表
      </h1>

      {/* 読み込み中はハートがドキドキし、終わると少し大きくなって止まる */}
      <PixelIcon
        pixels={heartIcon}
        className={twMerge(
          "size-10 text-ut-red transition-transform duration-300",
          isLoaded ? "scale-125" : "motion-safe:animate-heartbeat",
        )}
      />

      <div
        className={twMerge(
          "w-64 max-w-full space-y-2",
          props.isQuick && "hidden",
        )}
      >
        <div className="h-5 border-2 border-white p-0.5">
          <div
            className="h-full bg-ut-yellow transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>{isLoaded ? "LOADED" : "LOADING…"}</span>
          <span>{percent}%</span>
        </div>
      </div>

      <div className="h-16 text-center">
        {isLoaded ? (
          <div className="space-y-1">
            <div className="text-lg text-ut-yellow motion-safe:animate-twinkle">
              ＊ 画面を押して はじめる
            </div>
            <div className="text-xs text-gray-500">音が鳴ります</div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">＊ {line}</div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
