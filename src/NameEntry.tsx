import { useState } from "react";
import CommandButton from "./CommandButton";
import { checkIcon } from "./pixelIcons";

type Props = {
  initialName: string;
  onDecide: (name: string) => void;
};

const maxNameLength = 8;

// 最初に (またはステータスの名前を押したときに) プレイヤーの名前を決める画面
const NameEntry = (props: Props) => {
  const [name, setName] = useState(props.initialName);
  const trimmedName = name.trim();

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black p-4 motion-safe:animate-fade-in">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmedName !== "") {
            props.onDecide(trimmedName);
          }
        }}
        className="w-full max-w-md space-y-6 text-center"
      >
        <label htmlFor="playerName" className="block text-2xl tracking-widest">
          なまえを きめてください
        </label>
        <input
          id="playerName"
          type="text"
          autoFocus
          maxLength={maxNameLength}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full ut-input p-2 text-center text-2xl tracking-widest"
        />
        <div className="text-sm text-gray-400">
          {maxNameLength}文字まで。あとからステータスの名前を押すと変えられます
        </div>
        <CommandButton
          icon={checkIcon}
          type="submit"
          disabled={trimmedName === ""}
          className="mx-auto"
        >
          けってい
        </CommandButton>
      </form>
    </div>
  );
};

export default NameEntry;
