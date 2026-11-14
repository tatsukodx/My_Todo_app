export type Character = "sans" | "gaster";

export type Expression =
  | "normal" // 普通
  | "laugh" // 笑い
  | "angry" // 怒り
  | "sad" // 悲しみ
  | "smirk" // 嘲笑
  | "awkward"; // 気まずい

export const characterNames: Record<Character, string> = {
  sans: "サンズ",
  gaster: "ガスター",
};

export const expressionLabels: Record<Expression, string> = {
  normal: "普通",
  laugh: "笑い",
  angry: "怒り",
  sad: "悲しみ",
  smirk: "嘲笑",
  awkward: "気まずい",
};

// 画像は public/images/<キャラ>/<表情>.png に置く (例: public/images/sans/laugh.png)
// GitHub Pages では "/My_Todo_app/" 以下で公開されるため、BASE_URL を先頭に付ける
export const getCharacterImageUrl = (
  character: Character,
  expression: Expression,
): string => {
  return `${import.meta.env.BASE_URL}images/${character}/${expression}.png`;
};
