// 見出しやセリフの先頭の「＊」。セーブポイントの星のようにキラッと光らせる
const Star = () => (
  <span aria-hidden="true" className="inline-block motion-safe:animate-twinkle">
    ＊
  </span>
);

export default Star;
