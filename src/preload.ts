// ページを開いたときに、画像と音声を先に読み込んでおく
// (読み込みの途中で会話が始まって、立ち絵が出なかったり音が遅れたりしないように)
// public に画像や音声を増やしたときは、ここにも足す

const base = import.meta.env.BASE_URL;

const imageFiles = [
  ...["normal", "laugh", "angry", "sad", "smirk", "awkward"].map(
    (face) => `gaster/${face}`,
  ),
  ...["normal", "laugh", "angry", "smirk", "awkward"].map(
    (face) => `sans/${face}`,
  ),
  "shop/bg_nohand",
  "shop/bg_handup",
  ...["normal", "laugh", "angry", "awkward", "mock"].flatMap((face) => [
    `shop/gaster_${face}`,
    `shop/sans_${face}`,
  ]),
].map((file) => `${base}images/${file}.png`);

const soundFiles = [
  "select",
  "move",
  "damage",
  "heal",
  "levelup",
  "win",
  "joke",
  "spear",
  "voice_sans",
  "voice_gaster",
  "bgm_gaster",
  "bgm_sans",
].map((file) => `${base}sounds/${file}.mp3`);

const loadImage = (url: string): Promise<void> =>
  new Promise((resolve) => {
    const image = new Image();
    // 読み込めなかったファイルがあっても、止まらずに先へ進む
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });

// 音声は中身を一度取ってきておけば、ブラウザに残るので、あとで鳴らすときすぐ使える
const loadSound = (url: string): Promise<void> =>
  fetch(url)
    .then((response) => response.blob())
    .then(() => undefined)
    .catch(() => undefined);

export const preloadCount = imageFiles.length + soundFiles.length + 1;

// 全部読み込み終わったら終わる。1 つ終わるたびに onProgress (終わった数) を呼ぶ
export const preloadAll = (onProgress: (done: number) => void) => {
  let done = 0;
  const count = <T>(promise: Promise<T>) =>
    promise.then(() => {
      done += 1;
      onProgress(done);
    });
  return Promise.all([
    ...imageFiles.map((url) => count(loadImage(url))),
    ...soundFiles.map((url) => count(loadSound(url))),
    count(document.fonts.ready), // Web フォントも待つ
  ]);
};
