import Star from "./Star";
import { useEffect, useState } from "react";
import { characterNames } from "./characters";
import type { Character, Expression } from "./characters";
import type { DialogueLine } from "./dialogues";
import CharacterPortrait from "./CharacterPortrait";
import { twMerge } from "tailwind-merge";
import type { GasterWord } from "./wingdings";
import { getGasterWords, getWordSteps, toWingdings } from "./wingdings";

type Props = {
  patterns: DialogueLine[][];
  count: number;
};

const typingInterval = 50; // 1 文字を表示する間隔 (ミリ秒)
const wingdingsInterval = 20; // ガスターの記号を 1 文字表示する間隔 (ローマ字は長いので速め)
const nextLineDelay = 1800; // 1 セリフを表示し終えてから次へ進むまで
const closeDelay = 3000; // 最後のセリフを表示し終えてから閉じるまで
// 左右に 2 人並べるので少し小さめにする
// (画像は 100px 四方のドット絵なので、広い画面では拡大縮小せず等倍で表示する)
const portraitSize = "size-16 sm:size-[100px]";

// index 番目までのセリフのうち、そのキャラの最後のセリフの表情を返す
// (まだ話していなければ「普通」)
const getExpression = (
  lines: DialogueLine[],
  index: number,
  character: Character,
): Expression => {
  const spoken = lines
    .slice(0, index + 1)
    .filter((line) => line.speaker === character);
  if (spoken.length === 0) {
    return "normal";
  }
  return spoken[spoken.length - 1].expression;
};

// ガスターのセリフを step 歩目まで表示した内容を作る
// 完成した単語は日本語、書きかけの単語は Wingdings 風の記号で表示する
const renderGasterWords = (words: GasterWord[], step: number) => {
  const parts = [];
  let rest = step;
  for (const [i, word] of words.entries()) {
    const wordSteps = getWordSteps(word);
    if (rest >= wordSteps) {
      // 日本語に変わった瞬間、ふわっと浮かび上がらせる
      // (記号の span と key を分けて、別の要素として作り直させる)
      parts.push(
        <span key={`ja-${i}`} className="motion-safe:animate-fade-in">
          {word.japanese}
        </span>,
      );
      rest -= wordSteps;
    } else {
      if (rest > 0) {
        // 書きかけの記号は、ちらちら明滅させて不気味にする
        parts.push(
          <span
            key={`wd-${i}`}
            className="font-wingdings motion-safe:animate-flicker"
          >
            {word.romaji.slice(0, rest).map(toWingdings).join("")}
          </span>,
        );
      }
      break;
    }
  }
  return parts;
};

// 画面の上から出てきて、セリフを 1 文字ずつ表示し、自動で次へ進む会話ウィンドウ
const DialogueBox = (props: Props) => {
  // 初回表示のときだけ会話パターンをランダムに選ぶ (再描画では選び直さない)
  const [lines] = useState(
    () => props.patterns[Math.floor(Math.random() * props.patterns.length)],
  );
  const [index, setIndex] = useState(0);
  // 表示済みの文字数 (ガスターの記号付きセリフでは「何歩目まで進んだか」)
  const [charCount, setCharCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const line = lines[index];
  const isLast = index === lines.length - 1;
  // 絵文字などでも 1 文字ずつ数えられるよう、配列にしてから数える
  const chars = Array.from(line.text.replace("{count}", String(props.count)));
  // ガスターのセリフは、単語ごとに「記号 → 日本語」の順で表示する
  const gasterWords =
    line.speaker === "gaster" ? getGasterWords(line.text, props.count) : null;
  const totalSteps =
    gasterWords === null
      ? chars.length
      : gasterWords.reduce((sum, word) => sum + getWordSteps(word), 0);
  const isTyping = charCount < totalSteps;

  const goNext = () => {
    if (isLast) {
      setIsOpen(false);
    } else {
      setIndex(index + 1);
      setCharCount(0);
    }
  };

  // 表示されてすぐ、上からにょきっと出す
  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  // 1 文字ずつ表示し、表示し終えたら少し待って次のセリフへ進む
  // (依存配列を書かず、描画のたびに「次の 1 歩」のタイマーを 1 つだけ予約し直す)
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = isTyping
      ? window.setTimeout(
          () => setCharCount((n) => n + 1),
          gasterWords === null ? typingInterval : wingdingsInterval,
        )
      : window.setTimeout(goNext, isLast ? closeDelay : nextLineDelay);
    return () => window.clearTimeout(timer);
  });

  // クリックしたら、表示途中なら全文を出し、表示し終えていれば次へ進む
  const handleClick = () => {
    if (isTyping) {
      setCharCount(totalSteps);
    } else {
      goNext();
    }
  };

  return (
    <div
      className={twMerge(
        "fixed inset-x-0 top-0 z-50 mx-auto max-w-2xl px-4 pt-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isOpen ? "translate-y-0" : "pointer-events-none -translate-y-[120%]",
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full cursor-pointer items-start gap-2 border-4 border-white bg-black/70 p-2 text-left sm:gap-3 sm:p-3"
      >
        {/* 左にサンズ、右にガスター。話していない方は暗くする */}
        <CharacterPortrait
          character="sans"
          expression={getExpression(lines, index, "sans")}
          className={twMerge(
            portraitSize,
            line.speaker !== "sans" && "opacity-40",
            // セリフを表示している間は、話している方をカクカク上下させる
            isTyping && line.speaker === "sans" && "motion-safe:animate-talk",
          )}
        />
        <div className="min-w-0 grow">
          <div
            className={twMerge(
              "mb-1 text-ut-yellow",
              line.speaker === "gaster" && "text-right",
            )}
          >
            {characterNames[line.speaker]}
          </div>
          {/* 読み上げ用には全文を 1 回だけ伝え、見た目は 1 文字ずつ表示する */}
          <span className="sr-only" aria-live="polite">
            {chars.join("")}
          </span>
          <div
            aria-hidden="true"
            className={twMerge(
              "min-h-14 text-lg",
              line.speaker === "sans" && "font-sans-voice",
            )}
          >
            <Star />{" "}
            {gasterWords === null
              ? chars.slice(0, charCount).join("")
              : renderGasterWords(gasterWords, charCount)}
          </div>
          <div className="text-right text-sm text-gray-400">
            {!isTyping && (
              <>
                {/* 「次へ進める」ことが分かるよう、矢印を下に弾ませる */}
                <span className="inline-block motion-safe:animate-nudge-down">
                  ▼
                </span>{" "}
                {isLast ? "とじる" : "つぎへ"}{" "}
              </>
            )}
            ({index + 1}/{lines.length})
          </div>
        </div>
        <CharacterPortrait
          character="gaster"
          expression={getExpression(lines, index, "gaster")}
          className={twMerge(
            portraitSize,
            line.speaker !== "gaster" && "opacity-40",
            isTyping && line.speaker === "gaster" && "motion-safe:animate-talk",
          )}
        />
      </button>
    </div>
  );
};

export default DialogueBox;
