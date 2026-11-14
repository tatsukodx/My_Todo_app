import { gasterRomaji } from "./gasterRomaji";

// Wingdings フォントで英字・数字を打ったときに出る記号 (Unicode で同じ形のもの)
// フォントそのものは配布できないため、同じ見た目の文字に置き換えて表示する
const wingdingsLetters: Record<string, string> = {
  A: "✌",
  B: "👌",
  C: "👍",
  D: "👎",
  E: "☜",
  F: "☞",
  G: "☝",
  H: "☟",
  I: "✋",
  J: "☺",
  K: "😐",
  L: "☹",
  M: "💣",
  N: "☠",
  O: "⚐",
  P: "🏱",
  Q: "✈",
  R: "☼",
  S: "💧",
  T: "❄",
  U: "🕆",
  V: "✞",
  W: "🕈",
  X: "✠",
  Y: "✡",
  Z: "☪",
  "0": "📁",
  "1": "📂",
  "2": "📄",
  "3": "🗏",
  "4": "🗐",
  "5": "🗄",
  "6": "⌛",
  "7": "🖮",
  "8": "🖰",
  "9": "🖲",
};

// 1 文字 (英字・数字) を Wingdings 風の記号にする
// 末尾の「︎」は、カラー絵文字ではなく白黒の記号として表示させる指定
export const toWingdings = (char: string): string => {
  const symbol = wingdingsLetters[char.toUpperCase()];
  return symbol === undefined ? char : symbol + "︎";
};

export type GasterWord = {
  japanese: string; // 単語が完成したあとに表示する日本語
  romaji: string[]; // 先に 1 文字ずつ表示するローマ字 (1 文字ずつの配列)
};

// ガスターのセリフを単語ごとに分ける (データが無いセリフなら null)
export const getGasterWords = (
  text: string,
  count: number,
): GasterWord[] | null => {
  const words = gasterRomaji[text];
  if (words === undefined) {
    return null;
  }
  return words.map(([japanese, romaji]) => ({
    japanese: japanese.replace("{count}", String(count)),
    romaji: Array.from(romaji.replace("{count}", String(count))),
  }));
};

// 1 単語を表示し終えるまでの歩数
// (ローマ字を 1 文字ずつ出す歩数 + 日本語に置き換える 1 歩)
export const getWordSteps = (word: GasterWord): number => {
  return word.romaji.length + 1;
};
