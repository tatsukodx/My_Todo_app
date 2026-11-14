import type { PixelGrid } from "./pixelIcons";

type Props = {
  pixels: PixelGrid;
  className?: string;
};

// pixelIcons.ts の形を、1 マス = 1 ピクセルの SVG として描く
const PixelIcon = (props: Props) => {
  return (
    <svg
      viewBox={`0 0 ${props.pixels[0].length} ${props.pixels.length}`}
      shapeRendering="crispEdges" // 拡大してもドットの境目をぼかさない
      fill="currentColor" // 色は text-ut-red などの文字色に合わせる
      aria-hidden="true"
      className={props.className}
    >
      {props.pixels.map((row, y) =>
        [...row].map((cell, x) =>
          cell === "#" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
          ) : null,
        ),
      )}
    </svg>
  );
};

export default PixelIcon;
