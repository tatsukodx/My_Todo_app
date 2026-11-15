import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import Star from "./Star";
import type { Character } from "./characters";
import { characterNames } from "./characters";
import type { ShopFace, ShopLine } from "./shopTalks";
import type { SoundName } from "./sound";
import { playSansVoiceFor, playSound, startGasterVoice } from "./sound";

type Props = {
  lines: ShopLine[];
  playerName: string;
  itemName: string;
  endSound?: SoundName; // 最後のセリフを表示し終えたときに鳴らす音 (ギャグのオチなど)
  isPaused?: boolean; // true の間は話し始めない (画面の切り替えの演出中など)
  startDelay?: number; // 話し始めるまで待つ時間 (ミリ秒)
};

const typingInterval = 50; // 1 文字を表示する間隔 (ミリ秒)
const nextLineDelay = 1800; // 1 セリフを表示し終えてから次へ進むまで

const imageUrl = (file: string) =>
  `${import.meta.env.BASE_URL}images/shop/${file}.png`;

// index 番目までのセリフのうち、そのキャラの最後のセリフの表情 (まだ話していなければ普通)
const getFace = (
  lines: ShopLine[],
  index: number,
  character: Character,
): ShopFace => {
  const spoken = lines
    .slice(0, index + 1)
    .filter((line) => line.speaker === character);
  return spoken.length === 0 ? "normal" : spoken[spoken.length - 1].face;
};

// ショップのイラストと、その下の会話。セリフに合わせて二人の表情が変わる
const ShopScene = (props: Props) => {
  const [index, setIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const line = props.lines[index];
  const isLast = index === props.lines.length - 1;
  const chars = Array.from(
    line.text
      .replaceAll("{name}", props.playerName)
      .replaceAll("{item}", props.itemName),
  );
  const isTyping = charCount < chars.length;
  // 最初の 1 文字を出すまでは、まだ話し始めていない
  const hasStarted = index > 0 || charCount > 0;
  const isGasterTalking =
    !props.isPaused && hasStarted && isTyping && line.speaker === "gaster";

  const goNext = () => {
    if (!isLast) {
      setIndex(index + 1);
      setCharCount(0);
    }
  };

  // 1 文字ずつ表示し、表示し終えたら少し待って次のセリフへ (最後のセリフはそのまま残す)
  useEffect(() => {
    if (props.isPaused || (!isTyping && isLast)) {
      return;
    }
    const timer = isTyping
      ? window.setTimeout(
          () => {
            if (line.speaker === "sans") {
              playSansVoiceFor(chars[charCount]);
            }
            setCharCount((n) => n + 1);
          },
          hasStarted ? typingInterval : (props.startDelay ?? typingInterval),
        )
      : window.setTimeout(goNext, nextLineDelay);
    return () => window.clearTimeout(timer);
  });

  // ガスターの声は、セリフを表示している間だけくり返し鳴らす
  useEffect(() => {
    if (!isGasterTalking) {
      return;
    }
    return startGasterVoice();
  }, [isGasterTalking]);

  // 会話を最後まで表示し終えたら、オチの音を鳴らす
  const isFinished = isLast && !isTyping;
  const endSound = props.endSound;
  useEffect(() => {
    if (isFinished && endSound !== undefined) {
      playSound(endSound);
    }
  }, [isFinished, endSound]);

  // 200×150 の画像を同じ位置に重ねる (背景 → ガスターの顔 → サンズの顔)
  const layers = [
    line.handUp ? "bg_handup" : "bg_nohand",
    `gaster_${getFace(props.lines, index, "gaster")}`,
    `sans_${getFace(props.lines, index, "sans")}`,
  ];

  return (
    <div className="space-y-2">
      {/* 縦が短い画面でもスクロールせずに見えるよう、画面の高さに合わせて縮める */}
      <div className="relative mx-auto aspect-[4/3] w-[min(100%,400px,52vh)] border-4 border-white">
        {layers.map((file) => (
          <img
            key={file}
            src={imageUrl(file)}
            alt=""
            className="absolute inset-0 size-full [image-rendering:pixelated]"
          />
        ))}
      </div>
      <button
        type="button"
        data-silent
        onClick={() => (isTyping ? setCharCount(chars.length) : goNext())}
        className="block min-h-24 w-full cursor-pointer ut-box p-3 text-left"
      >
        <div className="mb-1 text-sm text-ut-yellow">
          {characterNames[line.speaker]}
        </div>
        <span className="sr-only" aria-live="polite">
          {chars.join("")}
        </span>
        <div
          aria-hidden="true"
          className={twMerge(line.speaker === "sans" && "font-sans-voice")}
        >
          <Star /> {chars.slice(0, charCount).join("")}
          {!isTyping && !isLast && (
            <span className="ml-1 inline-block text-gray-400 motion-safe:animate-nudge-down">
              ▼
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default ShopScene;
