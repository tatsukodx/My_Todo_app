// 効果音とキャラの声を鳴らす
// (ブラウザは、画面を一度クリックするなどの操作をするまで音を出させてくれないので、
//  それまでに鳴らそうとした音は、エラーにせず鳴らさないだけにする)

export type SoundName =
  | "select" // ボタンを押した
  | "move" // 選んでいる項目が動いた
  | "damage" // ダメージを受けた
  | "heal" // 回復した
  | "levelUp" // LV が上がった
  | "win" // タスクを完了して報酬をもらった
  | "joke" // ギャグのオチ (ツッタン)
  | "sansVoice"; // サンズの声 (1 文字ごと)

const soundFiles: Record<SoundName, string> = {
  select: "select",
  move: "move",
  damage: "damage",
  heal: "heal",
  levelUp: "levelup",
  win: "win",
  joke: "joke",
  sansVoice: "voice_sans",
};

const volumes: Partial<Record<SoundName, number>> = {
  move: 0.5,
  select: 0.6,
  sansVoice: 0.6,
};

const storageKey = "MyTodoAppSound";

const soundUrl = (file: string) =>
  `${import.meta.env.BASE_URL}sounds/${file}.mp3`;

// 同じ音は 1 つの Audio を使い回す (鳴らすたびに頭から鳴らし直す)
const audios = new Map<SoundName, HTMLAudioElement>();
const getAudio = (name: SoundName): HTMLAudioElement => {
  let audio = audios.get(name);
  if (audio === undefined) {
    audio = new Audio(soundUrl(soundFiles[name]));
    audio.volume = volumes[name] ?? 1;
    audios.set(name, audio);
  }
  return audio;
};

// ガスターの声は、しゃべっている間だけくり返し鳴らす
const gasterVoice = new Audio(soundUrl("voice_gaster"));
gasterVoice.loop = true;
gasterVoice.volume = 0.7;
let gasterTalkers = 0; // 今しゃべっている会話ウィンドウの数

const loadEnabled = (): boolean => {
  try {
    return localStorage.getItem(storageKey) !== "off";
  } catch {
    return true;
  }
};
let enabled = loadEnabled();

export const isSoundEnabled = (): boolean => enabled;

export const setSoundEnabled = (value: boolean) => {
  enabled = value;
  try {
    localStorage.setItem(storageKey, value ? "on" : "off");
  } catch {
    // 保存できなくても、今開いている間は設定どおりにする
  }
  if (!value) {
    audios.forEach((audio) => audio.pause());
    gasterVoice.pause();
    stopBgm();
  } else {
    if (gasterTalkers > 0) {
      void gasterVoice.play().catch(() => {});
    }
    unlockAudio();
  }
};

// マウスを乗せられない端末 (スマホやタブレット) か
// (指で操作するときは、スクロールやタップのたびに鳴ってうるさいので、選択が動く音は鳴らさない)
const isTouchDevice = (): boolean =>
  window.matchMedia("(hover: none)").matches;

export const playSound = (name: SoundName) => {
  if (!enabled) {
    return;
  }
  if (name === "move" && isTouchDevice()) {
    return;
  }
  // ボタンの音と重なったときは、あとから鳴らした音 (回復など) を聞かせる
  if (name !== "select" && name !== "move" && name !== "sansVoice") {
    getAudio("select").pause();
  }
  const audio = getAudio(name);
  audio.currentTime = 0;
  void audio.play().catch(() => {});
};

// ガスターの声を鳴らし始め、止めるための関数を返す
// (useEffect の後片付けで止めれば、しゃべり終えたときや画面を閉じたときに止まる)
export const startGasterVoice = (): (() => void) => {
  gasterTalkers += 1;
  if (gasterTalkers === 1) {
    gasterVoice.currentTime = 0;
    if (enabled) {
      void gasterVoice.play().catch(() => {});
    }
  }
  return () => {
    gasterTalkers -= 1;
    if (gasterTalkers === 0) {
      gasterVoice.pause();
    }
  };
};

// サンズの声は、文字 (空白や記号以外) が 1 つ出るたびに鳴らす
export const playSansVoiceFor = (char: string | undefined) => {
  if (char !== undefined && !/[\s、。,.!?！？…・「」()（）]/.test(char)) {
    playSound("sansVoice");
  }
};

// どのボタンを押しても「決定」の音を鳴らす (data-silent を付けた所は鳴らさない)
// (キャプチャで先に鳴らすので、ボタンの処理で別の音を鳴らせばそちらが優先される)
export const installButtonSounds = () => {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target instanceof Element ? e.target : null;
      const button = target?.closest("button");
      if (
        button &&
        !button.disabled &&
        button.closest("[data-silent]") === null
      ) {
        playSound("select");
      }
    },
    true,
  );
  // 最初に画面を触ったときに、音を出せるようにして BGM を流し始める
  document.addEventListener("pointerdown", unlockAudio, true);
  document.addEventListener("click", unlockAudio, true);
  document.addEventListener("keydown", unlockAudio, true);
};

// やること一覧を開閉するときの音。閉じるときは同じ音を逆再生する
// (逆再生は <audio> ではできないので、Web Audio で波形を読み込み、前後を反転させて鳴らす)
type SpearBuffers = { forward: AudioBuffer; reverse: AudioBuffer };

// 音の前後にある無音をけずる (逆再生したときに、鳴り始めるまで間があかないように)
const trimSilence = (buffer: AudioBuffer, reverse: boolean): AudioBuffer => {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, ch) =>
    buffer.getChannelData(ch),
  );
  const isLoud = (i: number) =>
    channels.some((data) => Math.abs(data[i]) > 0.01);
  let start = 0;
  while (start < buffer.length - 1 && !isLoud(start)) {
    start += 1;
  }
  let end = buffer.length - 1;
  while (end > start && !isLoud(end)) {
    end -= 1;
  }
  const result = new AudioBuffer({
    length: end - start + 1,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: buffer.sampleRate,
  });
  channels.forEach((data, ch) => {
    const part = data.slice(start, end + 1);
    if (reverse) {
      part.reverse();
    }
    result.copyToChannel(part, ch);
  });
  return result;
};

// 音のファイルを読み込んで、Web Audio で鳴らせる形にする
// (読み込むだけならクリック前でもできるので、ページを開いたらすぐ読み込んでおく)
const loadBuffer = (file: string): Promise<AudioBuffer> =>
  fetch(soundUrl(file))
    .then((response) => response.arrayBuffer())
    .then((data) =>
      new OfflineAudioContext({
        length: 1,
        sampleRate: 44100,
      }).decodeAudioData(data),
    );

const spearBuffers: Promise<SpearBuffers | null> = loadBuffer("spear")
  .then((buffer) => ({
    forward: trimSilence(buffer, false),
    reverse: trimSilence(buffer, true),
  }))
  .catch(() => null);

// AudioContext は、画面を触ってから作る (先に作るとブラウザに止められて警告が出る)
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  audioContext ??= new AudioContext();
  return audioContext;
};

let spearSource: AudioBufferSourceNode | null = null;

export const playSpear = (reverse: boolean) => {
  if (!enabled) {
    return;
  }
  getAudio("select").pause();
  const context = getAudioContext();
  void context.resume();
  void spearBuffers.then((buffers) => {
    if (buffers === null) {
      return;
    }
    // すばやく開け閉めしたときは、前の音を止めてから鳴らす
    spearSource?.stop();
    const source = context.createBufferSource();
    source.buffer = reverse ? buffers.reverse : buffers.forward;
    source.connect(context.destination);
    source.start();
    spearSource = source;
  });
};

// ---- BGM ----
// メイン画面ではガスターのテーマを 0.5 倍 (1 オクターブ低く、ゆっくり) で、
// 曲の最初と最後をフェードさせながら流し、終わったらまた最初から流す
// ショップではサンズのテーマを切れ目なくループさせる
export type BgmName = "main" | "shop";

const bgmSettings: Record<
  BgmName,
  { file: string; rate: number; volume: number; loop: boolean }
> = {
  main: { file: "bgm_gaster", rate: 0.5, volume: 0.35, loop: false },
  shop: { file: "bgm_sans", rate: 1, volume: 0.35, loop: true },
};
const fadeSeconds = 3; // メインの曲の最初と最後のフェードの長さ
const switchFadeSeconds = 0.6; // 曲を切り替えるときに、前の曲を消していく長さ

const bgmBuffers: Record<BgmName, Promise<AudioBuffer | null>> = {
  main: loadBuffer(bgmSettings.main.file).catch(() => null),
  shop: loadBuffer(bgmSettings.shop.file).catch(() => null),
};

let wantedBgm: BgmName | null = null; // 今の画面で流したい曲
let currentBgm: {
  name: BgmName;
  source: AudioBufferSourceNode;
  gain: GainNode;
} | null = null;

// 今の曲を、少しずつ小さくしてから止める
const stopBgm = (seconds = switchFadeSeconds) => {
  if (currentBgm === null || audioContext === null) {
    return;
  }
  const { source, gain } = currentBgm;
  const t = audioContext.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + seconds);
  source.onended = null;
  source.stop(t + seconds);
  currentBgm = null;
};

const startBgm = (name: BgmName) => {
  const context = audioContext;
  if (context === null || context.state !== "running") {
    return; // まだ画面を触っていないので、触ったときに流す
  }
  void bgmBuffers[name].then((buffer) => {
    // 読み込んでいる間に画面が変わったり、もう流れていたりしたら何もしない
    if (
      buffer === null ||
      !enabled ||
      wantedBgm !== name ||
      currentBgm?.name === name
    ) {
      return;
    }
    const setting = bgmSettings[name];
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = setting.rate;
    const gain = context.createGain();
    source.connect(gain).connect(context.destination);

    const t = context.currentTime;
    gain.gain.setValueAtTime(0, t);
    if (setting.loop) {
      source.loop = true;
      gain.gain.linearRampToValueAtTime(setting.volume, t + switchFadeSeconds);
    } else {
      // 遅く流すので、曲の長さも 1 / rate 倍になる
      const length = buffer.duration / setting.rate;
      const fade = Math.min(fadeSeconds, length / 3);
      gain.gain.linearRampToValueAtTime(setting.volume, t + fade);
      gain.gain.setValueAtTime(setting.volume, t + length - fade);
      gain.gain.linearRampToValueAtTime(0, t + length);
      // 最後まで流れたら、またフェードインから流し直す
      source.onended = () => {
        if (currentBgm?.source === source) {
          currentBgm = null;
          startBgm(name);
        }
      };
    }
    source.start();
    currentBgm = { name, source, gain };
  });
};

// 画面に合わせて流す曲を変える (null なら止める)
export const setBgm = (name: BgmName | null) => {
  wantedBgm = name;
  if (currentBgm !== null && currentBgm.name !== name) {
    stopBgm();
  }
  if (name !== null && enabled) {
    startBgm(name);
  }
};

// 画面を触ったときに音を出せるようにして、まだ流れていない BGM を流す
function unlockAudio() {
  if (!enabled) {
    return;
  }
  // ガスターがしゃべっている途中に初めて画面を触ったときは、そこから声を出す
  // (サンズの声は 1 文字ごとに鳴らし直すので、触った後の文字から自然に鳴る)
  if (gasterTalkers > 0 && gasterVoice.paused) {
    void gasterVoice.play().catch(() => {});
  }
  const context = getAudioContext();
  const start = () => {
    if (wantedBgm !== null && currentBgm === null) {
      startBgm(wantedBgm);
    }
  };
  if (context.state === "running") {
    start();
  } else {
    void context.resume().then(start);
  }
}
