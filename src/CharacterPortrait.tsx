import { useState } from "react";
import { twMerge } from "tailwind-merge";
import type { Character, Expression } from "./characters";
import {
  characterNames,
  expressionLabels,
  getCharacterImageUrl,
} from "./characters";

type Props = {
  character: Character;
  expression: Expression;
  className?: string; // 大きさなどを変えたいときに指定する
};

const CharacterPortrait = (props: Props) => {
  const imageUrl = getCharacterImageUrl(props.character, props.expression);
  // 読み込みに失敗した画像の URL を覚えておき、その間は仮の表示に切り替える
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const name = characterNames[props.character];
  const label = expressionLabels[props.expression];

  if (failedUrl === imageUrl) {
    return (
      <div
        className={twMerge(
          "flex size-24 shrink-0 flex-col items-center justify-center border-2 border-dashed border-gray-500 text-sm text-gray-400 sm:size-32",
          props.className,
        )}
      >
        <span>{name}</span>
        <span>({label})</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${name} (${label})`}
      onError={() => setFailedUrl(imageUrl)}
      className={twMerge(
        "size-24 shrink-0 object-contain sm:size-32",
        props.className,
      )}
    />
  );
};

export default CharacterPortrait;
