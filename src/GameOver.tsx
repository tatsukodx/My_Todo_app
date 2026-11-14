import CommandButton from "./CommandButton";
import PixelIcon from "./PixelIcon";
import { brokenHeartIcon, heartIcon } from "./pixelIcons";

type Props = {
  playerName: string;
  gold: number;
  onRevive: () => void;
};

// HP (自尊心) が 0 になったときの画面
const GameOver = (props: Props) => {
  return (
    <div className="fixed inset-0 z-80 flex flex-col items-center justify-center gap-8 bg-black p-4 text-center motion-safe:animate-fade-in">
      <PixelIcon
        pixels={brokenHeartIcon}
        className="h-16 w-20 text-ut-red motion-safe:animate-shake"
      />
      <h2 className="text-5xl tracking-[0.3em] sm:text-7xl">GAME OVER</h2>
      <p className="leading-relaxed">
        {props.playerName}の自尊心が、くだけてしまった……
        <br />
        それでも、タスクはまだ待っている。
      </p>
      <CommandButton icon={heartIcon} onClick={props.onRevive}>
        たちあがる
      </CommandButton>
      <p className="text-sm text-gray-400">
        HPはぜんかいふくしますが、GOLDが半分 ({Math.floor(props.gold / 2)} G)
        になります
      </p>
    </div>
  );
};

export default GameOver;
