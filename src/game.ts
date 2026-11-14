import type { Todo } from "./types";
import type { Character } from "./characters";

// 一時的に効果がつくアイテムの種類
// exp: もらえる経験値が 2 倍 / gold: もらえる GOLD が 2 倍 / guard: 受けるダメージが半分
export type BuffType = "exp" | "gold" | "guard";

// 画面の見た目が変わるおかしな効果 (wobble: ゆらゆら揺れる / rainbow: 虹色に見える)
export type ScreenEffect = "wobble" | "rainbow";

export type Player = {
  name: string;
  lv: number;
  exp: number; // 今の LV になってからためた経験値
  hp: number; // HP (自尊心)
  gold: number;
  items: Record<string, number>; // 持っているアイテム (アイテムの ID → 個数)
  buffs: Partial<Record<BuffType, number>>; // 効果が切れる日時 (ミリ秒)
  screenEffects: Partial<Record<ScreenEffect, number>>; // 画面の効果が切れる日時 (ミリ秒)
  rewardedIds: string[]; // 報酬を受け取ったタスクの ID (同じタスクで 2 回もらえないように)
  damagedIds: string[]; // 期限切れのダメージを受けたタスクの ID
  startedAt: number; // ゲームを始めた日時 (これより前に期限が切れたタスクではダメージを受けない)
};

export const createPlayer = (): Player => ({
  name: "",
  lv: 1,
  exp: 0,
  hp: 20,
  gold: 0,
  items: {},
  buffs: {},
  screenEffects: {},
  rewardedIds: [],
  damagedIds: [],
  startedAt: Date.now(),
});

const hpPerLevel = 4;
const maxSavedIds = 500; // 古い ID から捨てて、保存データが増えすぎないようにする

// LV 1 で 20、LV が 1 上がるごとに 4 ずつ増える
export const getMaxHp = (lv: number): number => 20 + (lv - 1) * hpPerLevel;

// 次の LV に上がるのに必要な経験値 (LV が上がるほど多く必要になる)
export const getNextExp = (lv: number): number => lv * 50;

// 優先度 (1 が低い、3 が高い) ごとの報酬とダメージ
const priorityTable: Record<
  number,
  { exp: number; gold: number; damage: number }
> = {
  1: { exp: 10, gold: 5, damage: 3 },
  2: { exp: 20, gold: 10, damage: 5 },
  3: { exp: 30, gold: 15, damage: 8 },
};
export const getPriorityTable = (priority: number) =>
  priorityTable[priority] ?? priorityTable[1];

export const isBuffActive = (
  player: Player,
  type: BuffType,
  now: number,
): boolean => (player.buffs[type] ?? 0) > now;

export type RewardResult = {
  player: Player;
  exp: number;
  gold: number;
  levelUps: number;
};

// タスクを完了したときの報酬 (経験値と GOLD) を渡し、たまったら LV を上げる
export const giveReward = (
  player: Player,
  todo: Todo,
  now: number,
): RewardResult => {
  if (player.rewardedIds.includes(todo.id)) {
    return { player, exp: 0, gold: 0, levelUps: 0 };
  }
  const table = getPriorityTable(todo.priority);
  const exp = table.exp * (isBuffActive(player, "exp", now) ? 2 : 1);
  const gold = table.gold * (isBuffActive(player, "gold", now) ? 2 : 1);

  let lv = player.lv;
  let restExp = player.exp + exp;
  let hp = player.hp;
  let levelUps = 0;
  while (restExp >= getNextExp(lv)) {
    restExp -= getNextExp(lv);
    lv++;
    levelUps++;
    hp += hpPerLevel; // 最大 HP が増えた分だけ、今の HP も増やす
  }

  return {
    player: {
      ...player,
      lv,
      exp: restExp,
      hp: Math.min(hp, getMaxHp(lv)),
      gold: player.gold + gold,
      rewardedIds: [...player.rewardedIds, todo.id].slice(-maxSavedIds),
    },
    exp,
    gold,
    levelUps,
  };
};

// まだダメージを受けていない、期限切れの未完了タスク
export const getNewlyOverdue = (
  player: Player,
  todos: Todo[],
  now: number,
): Todo[] =>
  todos.filter(
    (todo) =>
      !todo.isDone &&
      todo.deadline !== null &&
      todo.deadline.getTime() < now &&
      todo.deadline.getTime() > player.startedAt &&
      !player.damagedIds.includes(todo.id),
  );

// 期限切れのタスク 1 件で受けるダメージ (作業報告書に書くため)
export const getDamageFor = (
  player: Player,
  todo: Todo,
  now: number,
): number => {
  const damage = getPriorityTable(todo.priority).damage;
  return isBuffActive(player, "guard", now) ? Math.ceil(damage / 2) : damage;
};

// 期限切れのタスクの分だけダメージを受ける (HP は 0 より下がらない)
export const takeDamage = (
  player: Player,
  overdueTodos: Todo[],
  now: number,
): { player: Player; damage: number } => {
  const total = overdueTodos.reduce(
    (sum, todo) => sum + getPriorityTable(todo.priority).damage,
    0,
  );
  const damage = isBuffActive(player, "guard", now)
    ? Math.ceil(total / 2)
    : total;
  return {
    player: {
      ...player,
      hp: Math.max(0, player.hp - damage),
      damagedIds: [
        ...player.damagedIds,
        ...overdueTodos.map((todo) => todo.id),
      ].slice(-maxSavedIds),
    },
    damage,
  };
};

// ゲームオーバーから立ち上がる (HP は全回復、GOLD は半分になる)
export const revive = (player: Player): Player => ({
  ...player,
  hp: getMaxHp(player.lv),
  gold: Math.floor(player.gold / 2),
});

// ショップのアイテム
export type ItemEffect =
  | { type: "heal"; amount: number | "full" }
  | { type: "randomHeal"; min: number; max: number } // min 〜 max のどれかだけ HP が変わる (マイナスもある)
  | { type: "buff"; buff: BuffType; hours: number }
  | { type: "mystery" }; // 何が起きるかは使うまで分からない

export type Item = {
  id: string;
  name: string;
  price: number;
  description: string;
  effects: ItemEffect[]; // 使ったときの効果 (複数あれば順にすべて効く)
  jokeBy?: Character; // ギャグのアイテムなら、使ったときにギャグを言うキャラ
};

export const items: Item[] = [
  {
    id: "ketchup",
    name: "ケチャップ",
    price: 10,
    description: "HPを10かいふく",
    effects: [{ type: "heal", amount: 10 }],
  },
  {
    id: "coffee",
    name: "研究所のコーヒー",
    price: 25,
    description: "HPを25かいふく",
    effects: [{ type: "heal", amount: 25 }],
  },
  {
    id: "dinner",
    name: "ごほうびディナー",
    price: 60,
    description: "HPをぜんかいふく",
    effects: [{ type: "heal", amount: "full" }],
  },
  {
    id: "hotdog",
    name: "ホットドッグ",
    price: 15,
    description: "HPを15かいふく",
    effects: [{ type: "heal", amount: 15 }],
  },
  {
    id: "spaghetti",
    name: "パピルスのスパゲッティ",
    price: 12,
    description: "HPが-5〜25かわる",
    effects: [{ type: "randomHeal", min: -5, max: 25 }],
  },
  {
    id: "strongCoffee",
    name: "豆を挽きすぎたコーヒー",
    price: 30,
    description: "？？？",
    effects: [{ type: "mystery" }],
  },
  {
    id: "cupNoodle",
    name: "カップめん",
    price: 8,
    description: "HPを8かいふく",
    effects: [{ type: "heal", amount: 8 }],
  },
  {
    id: "donut",
    name: "差し入れのドーナツ",
    price: 20,
    description: "HPを20かいふく",
    effects: [{ type: "heal", amount: 20 }],
  },
  {
    id: "boneCookie",
    name: "ホネ型クッキー",
    price: 18,
    description: "HPを18かいふく",
    effects: [{ type: "heal", amount: 18 }],
  },
  {
    id: "iceCream",
    name: "ナイスクリーム",
    price: 12,
    description: "HPを12かいふく",
    effects: [{ type: "heal", amount: 12 }],
  },
  {
    id: "bigKetchup",
    name: "業務用ケチャップ",
    price: 35,
    description: "HPを40かいふく",
    effects: [{ type: "heal", amount: 40 }],
  },
  {
    id: "pillow",
    name: "サンズのまくら",
    price: 55,
    description: "HPをぜんかいふく",
    effects: [{ type: "heal", amount: "full" }],
  },
  {
    id: "switch",
    name: "やる気スイッチ",
    price: 40,
    description: "24時間、もらえるEXPが2倍",
    effects: [{ type: "buff", buff: "exp", hours: 24 }],
  },
  {
    id: "alarm",
    name: "めざまし時計",
    price: 20,
    description: "6時間、もらえるEXPが2倍",
    effects: [{ type: "buff", buff: "exp", hours: 6 }],
  },
  {
    id: "energyDrink",
    name: "徹夜ドリンク",
    price: 45,
    description: "HPを10かいふく＋12時間、EXPが2倍",
    effects: [
      { type: "heal", amount: 10 },
      { type: "buff", buff: "exp", hours: 12 },
    ],
  },
  {
    id: "bonus",
    name: "ボーナス申請書",
    price: 40,
    description: "24時間、もらえるGOLDが2倍",
    effects: [{ type: "buff", buff: "gold", hours: 24 }],
  },
  {
    id: "oldCoin",
    name: "研究所の古いコイン",
    price: 25,
    description: "12時間、もらえるGOLDが2倍",
    effects: [{ type: "buff", buff: "gold", hours: 12 }],
  },
  {
    id: "labcoat",
    name: "ぶあつい白衣",
    price: 35,
    description: "24時間、受けるダメージが半分",
    effects: [{ type: "buff", buff: "guard", hours: 24 }],
  },
  {
    id: "stickyNotes",
    name: "付箋の束",
    price: 15,
    description: "12時間、受けるダメージが半分",
    effects: [{ type: "buff", buff: "guard", hours: 12 }],
  },
  {
    id: "researchNote",
    name: "ガスターの研究ノート",
    price: 80,
    description: "24時間、EXPが2倍＋ダメージが半分",
    effects: [
      { type: "buff", buff: "exp", hours: 24 },
      { type: "buff", buff: "guard", hours: 24 },
    ],
  },
  {
    id: "sansJoke",
    name: "サンズのギャグ",
    price: 5,
    description: "笑ってHPを5かいふく",
    effects: [{ type: "heal", amount: 5 }],
    jokeBy: "sans",
  },
  {
    id: "gasterJoke",
    name: "ガスター博士のギャグ",
    price: 150,
    description: "HPぜんかいふく＋24時間EXPとGOLDが2倍 (高級品)",
    effects: [
      { type: "heal", amount: "full" },
      { type: "buff", buff: "exp", hours: 24 },
      { type: "buff", buff: "gold", hours: 24 },
    ],
    jokeBy: "gaster",
  },
];

export const buyItem = (player: Player, item: Item): Player => ({
  ...player,
  gold: player.gold - item.price,
  items: { ...player.items, [item.id]: (player.items[item.id] ?? 0) + 1 },
});

// 「豆を挽きすぎたコーヒー」で起きること (jackpot はまれに起きる大当たり)
export type MysteryResult = "wobble" | "rainbow" | "both" | "jackpot";

const screenEffectMinutes = 5; // 画面がおかしくなっている時間
const jackpotGold = 100;

// 0 以上 1 未満の数から、何が起きるかを決める
const pickMystery = (roll: number): MysteryResult => {
  if (roll < 0.05) return "jackpot";
  if (roll < 0.15) return "both";
  if (roll < 0.575) return "wobble";
  return "rainbow";
};

export const isScreenEffectActive = (
  player: Player,
  type: ScreenEffect,
  now: number,
): boolean => (player.screenEffects[type] ?? 0) > now;

const addHp = (player: Player, amount: number): Player => ({
  ...player,
  hp: Math.max(0, Math.min(getMaxHp(player.lv), player.hp + amount)),
});

// 同じ効果がついているときは、残り時間に足す
const addBuff = (
  player: Player,
  buff: BuffType,
  hours: number,
  now: number,
): Player => {
  const until = Math.max(player.buffs[buff] ?? 0, now);
  return {
    ...player,
    buffs: { ...player.buffs, [buff]: until + hours * 3600_000 },
  };
};

const addScreenEffect = (
  player: Player,
  type: ScreenEffect,
  now: number,
): Player => ({
  ...player,
  screenEffects: {
    ...player.screenEffects,
    [type]: now + screenEffectMinutes * 60_000,
  },
});

export type UseResult = {
  player: Player;
  hpChange: number; // HP がどれだけ変わったか (マイナスなら減った)
  mystery?: MysteryResult;
};

// アイテムを 1 つ使う。random は 0 以上 1 未満の数を返す関数 (ふつうは Math.random)
// (名前を use〜 にすると React のフックと間違われるので consume にする)
export const consumeItem = (
  player: Player,
  item: Item,
  now: number,
  random: () => number = Math.random,
): UseResult => {
  let current: Player = {
    ...player,
    items: { ...player.items, [item.id]: (player.items[item.id] ?? 1) - 1 },
  };
  let mystery: MysteryResult | undefined;

  for (const effect of item.effects) {
    if (effect.type === "heal") {
      const maxHp = getMaxHp(current.lv);
      current = addHp(
        current,
        effect.amount === "full" ? maxHp : effect.amount,
      );
    } else if (effect.type === "randomHeal") {
      const amount =
        effect.min + Math.floor(random() * (effect.max - effect.min + 1));
      current = addHp(current, amount);
    } else if (effect.type === "buff") {
      current = addBuff(current, effect.buff, effect.hours, now);
    } else {
      mystery = pickMystery(random());
      if (mystery === "jackpot") {
        // 大当たり: HP ぜんかいふく、24 時間すべて 2 倍・半減、GOLD もおまけ
        current = addHp(current, getMaxHp(current.lv));
        for (const buff of ["exp", "gold", "guard"] as const) {
          current = addBuff(current, buff, 24, now);
        }
        current = { ...current, gold: current.gold + jackpotGold };
      } else {
        current = addHp(current, 5);
        if (mystery === "wobble" || mystery === "both") {
          current = addScreenEffect(current, "wobble", now);
        }
        if (mystery === "rainbow" || mystery === "both") {
          current = addScreenEffect(current, "rainbow", now);
        }
      }
    }
  }

  return { player: current, hpChange: current.hp - player.hp, mystery };
};
