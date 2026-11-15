import { useState } from "react";
import { twMerge } from "tailwind-merge";
import type { Item, MysteryResult, Player, UseResult } from "./game";
import { getMaxHp, isScreenEffectActive, items } from "./game";
import type { ShopLine, ShopTalkKey } from "./shopTalks";
import { itemTalks, jokeTalks, shopTalks } from "./shopTalks";
import ShopScene from "./ShopScene";
import type { SoundName } from "./sound";
import { playSound } from "./sound";
import CommandButton from "./CommandButton";
import { checkIcon, heartIcon, shopIcon } from "./pixelIcons";

type Props = {
  player: Player;
  onBuy: (item: Item) => void;
  onUse: (item: Item) => UseResult;
  now: number;
  onClose: () => void;
};

const itemsPerPage = 4; // 1 ページに並べるアイテムの数 (スクロールしなくても会話が見えるように)

// 豆を挽きすぎたコーヒーの結果ごとの会話
const mysteryTalkKeys: Record<MysteryResult, ShopTalkKey> = {
  wobble: "mysteryWobble",
  rainbow: "mysteryRainbow",
  both: "mysteryBoth",
  jackpot: "mysteryJackpot",
};

const pickRandom = <T,>(patterns: T[]): T =>
  patterns[Math.floor(Math.random() * patterns.length)];

// ショップ画面。アイテムを選ぶと説明、買う・使うとそのたびに二人が話す
const Shop = (props: Props) => {
  const [tab, setTab] = useState<"buy" | "use">("buy");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 今の会話と、会話を最初から始め直すための番号
  const [talk, setTalk] = useState(() => ({
    lines: pickRandom(shopTalks.enter),
    itemName: "",
    endSound: undefined as SoundName | undefined,
    count: 0,
  }));

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const ownedItems = items.filter(
    (item) => (props.player.items[item.id] ?? 0) > 0,
  );
  const listItems = tab === "buy" ? items : ownedItems;
  const pageCount = Math.max(1, Math.ceil(listItems.length / itemsPerPage));
  // アイテムを使い切ってページが減ったときは、最後のページを表示する
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = listItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const say = (lines: ShopLine[], itemName = "", endSound?: SoundName) => {
    setTalk((current) => ({
      lines,
      itemName,
      endSound,
      count: current.count + 1,
    }));
  };
  const sayRandom = (key: ShopTalkKey, itemName = "") =>
    say(pickRandom(shopTalks[key]), itemName);

  const changeTab = (key: "buy" | "use") => {
    setTab(key);
    setPage(0);
    setSelectedId(null);
  };

  const selectItem = (item: Item) => {
    setSelectedId(item.id);
    if (tab === "buy") {
      say(pickRandom(itemTalks[item.id]), item.name);
    }
  };

  const buy = () => {
    if (selected === null) {
      return;
    }
    if (props.player.gold < selected.price) {
      sayRandom("poor", selected.name);
      return;
    }
    props.onBuy(selected);
    sayRandom("buy", selected.name);
  };

  const use = () => {
    if (selected === null) {
      return;
    }
    const onlyHeals = selected.effects.every(
      (effect) => effect.type === "heal",
    );
    const isHpFull = props.player.hp >= getMaxHp(props.player.lv);
    // ギャグは HP が満タンでも聞ける。回復だけのアイテムは満タンなら使わない
    if (selected.jokeBy === undefined && onlyHeals && isHpFull) {
      sayRandom("full", selected.name);
      return;
    }
    const result = props.onUse(selected);
    if (selected.jokeBy !== undefined) {
      // ギャグは、オチまで聞いたら「ツッタン」と鳴らす
      say(pickRandom(jokeTalks[selected.jokeBy]), selected.name, "joke");
    } else if (result.mystery !== undefined) {
      sayRandom(mysteryTalkKeys[result.mystery], selected.name);
    } else if (result.hpChange < 0) {
      playSound("damage");
      sayRandom("hurt", selected.name);
    } else {
      if (result.hpChange > 0) {
        playSound("heal");
      }
      const isBuff = selected.effects.some((effect) => effect.type === "buff");
      sayRandom(isBuff ? "buff" : "heal", selected.name);
    }
    if ((props.player.items[selected.id] ?? 0) <= 1) {
      setSelectedId(null); // 最後の 1 つを使ったら、選択を外す
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black motion-safe:animate-fade-in">
      {/* 下の説明ポップアップに隠れないよう、下に余白をあけておく */}
      <div
        className={twMerge(
          "mx-auto max-w-2xl space-y-3 p-4 pb-28",
          // 豆を挽きすぎたコーヒーで、ショップの中もゆらゆら揺れる
          isScreenEffectActive(props.player, "wobble", props.now) &&
            "motion-safe:animate-screen-wobble",
        )}
      >
        <ShopScene
          key={talk.count}
          lines={talk.lines}
          playerName={props.player.name}
          itemName={talk.itemName}
          endSound={talk.endSound}
        />

        <div className="flex flex-wrap items-center gap-2">
          {(["buy", "use"] as const).map((key) => (
            <CommandButton
              key={key}
              icon={key === "buy" ? shopIcon : heartIcon}
              size="sm"
              onClick={() => changeTab(key)}
              className={twMerge(
                tab === key && "border-ut-yellow text-ut-yellow",
              )}
            >
              {key === "buy" ? "かう" : "つかう"}
            </CommandButton>
          ))}
          <CommandButton
            icon={checkIcon}
            size="sm"
            onClick={() => {
              sayRandom("leave");
              window.setTimeout(props.onClose, 1200);
            }}
          >
            でる
          </CommandButton>
          <span className="ml-auto text-ut-yellow">{props.player.gold} G</span>
        </div>

        <div className="ut-box p-2">
          {listItems.length === 0 && (
            <div className="p-2 text-gray-500">
              ＊ 持っているアイテムはありません
            </div>
          )}
          {pageItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectItem(item)}
              className={twMerge(
                "flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left hover:text-ut-yellow",
                item.id === selectedId && "text-ut-yellow",
              )}
            >
              <span className="w-4 text-ut-red">
                {item.id === selectedId ? "♥" : ""}
              </span>
              <span className="grow">{item.name}</span>
              <span className="text-sm text-gray-400">
                {tab === "buy"
                  ? `${item.price} G`
                  : `×${props.player.items[item.id]}`}
              </span>
            </button>
          ))}
          {pageCount > 1 && (
            <div className="mt-1 flex items-center justify-center gap-4 border-t border-gray-700 pt-1 text-sm">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="前のページ"
                className="cursor-pointer px-2 text-ut-orange hover:text-ut-yellow disabled:cursor-not-allowed disabled:opacity-30"
              >
                ◀
              </button>
              <span className="text-gray-400">
                {currentPage + 1} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount - 1}
                aria-label="次のページ"
                className="cursor-pointer px-2 text-ut-orange hover:text-ut-yellow disabled:cursor-not-allowed disabled:opacity-30"
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 選んだアイテムの説明は、画面の下からにょきっと出す (選び直すたびに出し直す) */}
      {selected !== null && (
        <div
          key={`${tab}-${selected.id}`}
          className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-2xl px-4 pb-4 motion-safe:animate-pop-up"
        >
          <div className="flex flex-wrap items-center gap-3 ut-box p-3">
            <div className="min-w-0 grow">
              <div className="text-ut-yellow">{selected.name}</div>
              <div className="text-sm text-gray-400">
                {selected.description}
              </div>
            </div>
            {tab === "buy" ? (
              <CommandButton icon={shopIcon} onClick={buy}>
                {selected.price} G でかう
              </CommandButton>
            ) : (
              <CommandButton icon={heartIcon} onClick={use}>
                つかう
              </CommandButton>
            )}
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="説明をとじる"
              className="cursor-pointer px-1 text-xl text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
