import { useState } from "react";
import App from "./App";
import LoadingScreen from "./LoadingScreen";

// 一度読み込み終えたら、それを覚えておくための localStorage のキー
const loadedKey = "MyTodoAppLoaded";

const hasLoadedBefore = (): boolean => {
  try {
    return localStorage.getItem(loadedKey) === "done";
  } catch {
    return false;
  }
};

// 最初は読み込み画面を出し、「はじめる」を押したらアプリを始める
// (アプリを後から出すので、最初の会話は読み込みが終わってから始まる)
// 一度読み込めた後は、画像や音声がブラウザに残っているので、読み込みバーは出さずに
// 「はじめる」だけを出す (押してもらうと、最初のセリフから声が出せる)
const Root = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isQuick] = useState(hasLoadedBefore);

  const start = () => {
    try {
      localStorage.setItem(loadedKey, "done");
    } catch {
      // 覚えておけなくても、今回はそのまま始める
    }
    setIsStarted(true);
  };

  return isStarted ? (
    <App />
  ) : (
    <LoadingScreen onStart={start} isQuick={isQuick} />
  );
};

export default Root;
