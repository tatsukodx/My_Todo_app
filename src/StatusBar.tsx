import { twMerge } from "tailwind-merge";
import type { BuffType, Player } from "./game";
import { getMaxHp, getNextExp, isBuffActive } from "./game";
import CommandButton from "./CommandButton";
import { shopIcon } from "./pixelIcons";

type Props = {
  player: Player;
  now: number;
  onRename: () => void;
  onOpenShop: () => void;
};

const buffLabels: Record<BuffType, string> = {
  exp: "EXP×2",
  gold: "GOLD×2",
  guard: "ダメージ半減",
};

// 戦闘画面の下に出ている「名前・LV・HP」のような、プレイヤーの状態
const StatusBar = (props: Props) => {
  const player = props.player;
  const maxHp = getMaxHp(player.lv);
  const nextExp = getNextExp(player.lv);
  const activeBuffs = (Object.keys(buffLabels) as BuffType[]).filter((type) =>
    isBuffActive(player, type, props.now),
  );

  return (
    <div className="space-y-2 ut-box p-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={props.onRename}
          aria-label={`名前を変える (今は ${player.name})`}
          className="cursor-pointer text-lg tracking-widest hover:text-ut-yellow"
        >
          {player.name}
        </button>
        <span className="text-lg">LV {player.lv}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm">HP</span>
          {/* 赤い棒の上に、残りの HP の分だけ黄色を重ねる */}
          <div
            role="meter"
            aria-label="HP (自尊心)"
            aria-valuemin={0}
            aria-valuemax={maxHp}
            aria-valuenow={player.hp}
            className="h-5 w-24 bg-ut-red sm:w-32"
          >
            <div
              className="h-full bg-ut-yellow transition-[width] duration-500"
              style={{ width: `${(player.hp / maxHp) * 100}%` }}
            />
          </div>
          <span className={twMerge(player.hp <= maxHp / 4 && "text-ut-red")}>
            {player.hp} / {maxHp}
          </span>
        </div>
        <span className="text-ut-yellow">{player.gold} G</span>
        <CommandButton
          icon={shopIcon}
          size="sm"
          onClick={props.onOpenShop}
          className="ml-auto"
        >
          ショップ
        </CommandButton>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
        <span>
          EXP {player.exp} / {nextExp}
        </span>
        <div className="h-1.5 w-24 bg-gray-700">
          <div
            className="h-full bg-white transition-[width] duration-500"
            style={{ width: `${(player.exp / nextExp) * 100}%` }}
          />
        </div>
        {activeBuffs.map((type) => (
          <span
            key={type}
            className="border border-ut-orange px-1.5 text-xs text-ut-orange"
          >
            {buffLabels[type]} あと
            {Math.ceil(((player.buffs[type] ?? 0) - props.now) / 3600_000)}
            時間
          </span>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
