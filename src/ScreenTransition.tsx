import { useEffect, useRef } from "react";
import PixelIcon from "./PixelIcon";
import { heartIcon } from "./pixelIcons";
import { playSound } from "./sound";

export type Point = { x: number; y: number };

type Props = {
  origin: Point; // 押したボタンの位置。ここに向かって画面が閉じていく
  onCovered: () => void; // 画面が真っ暗になったとき (ここで画面を切り替える)
  onDone: () => void; // 演出が全部終わったとき
};

// 原作で戦闘が始まるときのような画面の切り替え
// 1. 押したボタンに向かって、丸い穴が縮むように画面が暗くなる
// 2. 真っ暗な中で、そこに赤いハートが 3 回点滅する
// 3. ハートが画面の真ん中へ飛んでいき、大きくなる
// 4. 真ん中から丸い穴が広がって、次の画面が見える (ハートは弾けて消える)
const ScreenTransition = (props: Props) => {
  const irisRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  // 演出の途中で props の関数が変わっても、最新のものを呼べるようにしておく
  const callbacksRef = useRef(props);
  useEffect(() => {
    callbacksRef.current = props;
  });
  const { x, y } = props.origin;

  useEffect(() => {
    const iris = irisRef.current;
    const heart = heartRef.current;
    if (iris === null || heart === null) {
      return;
    }
    // 動きを減らす設定のときは、演出なしで切り替える
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      callbacksRef.current.onCovered();
      callbacksRef.current.onDone();
      return;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    // どこを中心にしても画面の隅まで届く大きさ
    const full = `${Math.hypot(window.innerWidth, window.innerHeight) * 2}px`;
    const animations: Animation[] = [];
    const animate = (
      element: HTMLElement,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const animation = element.animate(keyframes, {
        fill: "forwards",
        ...options,
      });
      animations.push(animation);
      return animation.finished;
    };
    const at = (px: number, py: number) => ({
      left: `${px}px`,
      top: `${py}px`,
    });

    const run = async () => {
      // 1. ボタンに向かって閉じる (ドット絵っぽく、カクカク縮める)
      await animate(
        iris,
        [
          { width: full, height: full, ...at(x, y) },
          { width: "0px", height: "0px", ...at(x, y) },
        ],
        { duration: 380, easing: "steps(10, end)" },
      );
      callbacksRef.current.onCovered();

      // 2. ハートを 3 回点滅させる
      playSound("move");
      await animate(
        heart,
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.5 },
          { opacity: 0, offset: 0.5 },
          { opacity: 0, offset: 1 },
        ],
        { duration: 140, iterations: 3, fill: "none" },
      );

      // 3. 真ん中へ飛んでいく (少し後ろに下がってから勢いよく)
      await animate(
        heart,
        [
          { transform: "scale(1)", opacity: 1, ...at(x, y) },
          {
            transform: "scale(3)",
            opacity: 1,
            ...at(centerX, centerY),
          },
        ],
        { duration: 280, easing: "cubic-bezier(0.6, -0.5, 0.4, 1.4)" },
      );

      // 4. 真ん中から開く。ハートは大きくなりながら消える
      playSound("select");
      await Promise.all([
        animate(
          iris,
          [
            { width: "0px", height: "0px", ...at(centerX, centerY) },
            { width: full, height: full, ...at(centerX, centerY) },
          ],
          { duration: 420, easing: "steps(12, end)" },
        ),
        animate(
          heart,
          [
            {
              transform: "scale(3)",
              opacity: 1,
              ...at(centerX, centerY),
            },
            {
              transform: "scale(9)",
              opacity: 0,
              ...at(centerX, centerY),
            },
          ],
          { duration: 300, easing: "ease-out" },
        ),
      ]);
      callbacksRef.current.onDone();
    };

    // 開発中の StrictMode で 2 回動かされたときは、1 回目を止めて捨てる
    run().catch(() => {});
    return () => animations.forEach((animation) => animation.cancel());
  }, [x, y]);

  return (
    // 演出の間は、下の画面を押せないようにする
    <div className="fixed inset-0 z-[85] overflow-hidden" aria-hidden="true">
      {/* 丸い穴の外側を、大きな影で黒く塗りつぶす */}
      <div
        ref={irisRef}
        className="absolute -translate-1/2 rounded-full shadow-[0_0_0_200vmax_black]"
        style={{ left: x, top: y, width: "300vmax", height: "300vmax" }}
      />
      <div
        ref={heartRef}
        className="absolute -translate-1/2 opacity-0"
        style={{ left: x, top: y }}
      >
        <PixelIcon pixels={heartIcon} className="size-6 text-ut-red" />
      </div>
    </div>
  );
};

export default ScreenTransition;
