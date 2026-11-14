import type { Character } from "./characters";

// ショップのイラストの表情差分 (public/images/shop/<キャラ>_<表情>.png)
export type ShopFace = "normal" | "laugh" | "angry" | "awkward" | "mock";

export type ShopLine = {
  speaker: Character;
  face: ShopFace;
  text: string; // {name} はプレイヤー名、{item} はアイテム名に置き換わる
  handUp?: boolean; // サンズが片手をすくめている背景にするか
};

// 会話データを短く書くための関数
const sans = (face: ShopFace, text: string, handUp = false): ShopLine => ({
  speaker: "sans",
  face,
  text,
  handUp,
});
const gaster = (face: ShopFace, text: string): ShopLine => ({
  speaker: "gaster",
  face,
  text,
});

// 場面ごとに複数の会話パターンを用意し、そのたびに 1 つを選ぶ
export const shopTalks = {
  // 店に入ったとき
  enter: [
    [
      sans("normal", "よう、{name}。ここは研究所の売店だぜ"),
      gaster(
        "laugh",
        "ふむ。研究費の足しになるのだよ。遠慮なく買っていきたまえ。",
      ),
    ],
    [
      gaster("normal", "おや、{name}君。いらっしゃい。"),
      sans("mock", "ハカセ、売店の店番はオイラの仕事じゃなかったか？", true),
      gaster("awkward", "……たまには私も接客をしてみたくなるのだよ。"),
    ],
    [
      sans(
        "awkward",
        "……ん？ ああ、{name}か。寝てないぜ、ちょっと目を閉じてただけだ",
      ),
      gaster("angry", "サンズ君、店番中の居眠りは禁止だと言ったはずだよ。"),
      sans("mock", "ハカセだって実験中に寝てたじゃないか", true),
    ],
    [
      gaster("laugh", "ちょうど新しい商品を並べたところだよ、{name}君。"),
      sans("normal", "並べたのはオイラだけどな"),
      gaster("normal", "……ふむ。手伝ってくれて感謝しているよ。"),
    ],
    [
      sans("laugh", "いらっしゃい。今日はパピルスが描いた絵も飾ってあるんだ"),
      gaster("awkward", "……あれは私の設計図の裏だったのだがね。"),
      sans("mock", "いい紙を使ってるって褒めてたぜ", true),
    ],
  ],
  // 買ったとき
  buy: [
    [
      sans("laugh", "まいどあり。{item}、たしかに渡したぜ"),
      gaster("laugh", "ふむ。良い買い物だね。"),
    ],
    [
      gaster("normal", "{item}だね。大事に使いたまえ。"),
      sans("mock", "ヘヘ、売り上げは全部コーヒー代に消えるんだけどな", true),
      gaster("angry", "サンズ君！"),
    ],
    [
      sans("normal", "{item}な。袋はいるか？"),
      sans("mock", "……まあ、袋なんてないんだけどな", true),
      gaster("awkward", "経費削減なのだよ。"),
    ],
    [
      gaster("laugh", "ありがとう、{name}君。これで新しいフラスコが買えるよ。"),
      sans("awkward", "ハカセ、この前もそう言ってコーヒー豆買ってたよな"),
      gaster("awkward", "……フラスコでコーヒーをいれるのだよ。"),
    ],
    [
      sans("laugh", "いい目をしてるな、{name}。{item}は人気商品だぜ"),
      gaster("normal", "ふむ。今月はまだ二つしか売れていないがね。"),
      sans("mock", "そういうのは言わなくていいんだよ", true),
    ],
  ],
  // GOLD が足りないとき
  poor: [
    [
      sans("awkward", "おっと、GOLDが足りないみたいだぜ"),
      gaster("normal", "タスクを片付ければ、GOLDはたまるのだよ。"),
    ],
    [
      gaster("awkward", "……ふむ。ツケはきかないのだがね。"),
      sans("mock", "ハカセのコーヒー代はツケだらけなのにな", true),
    ],
    [
      sans("normal", "サイフの中、空っぽじゃないか"),
      sans(
        "mock",
        "オイラの頭の中と同じだな。……ホネしかないって意味だぜ",
        true,
      ),
      gaster("awkward", "……サンズ君、自分で言っていて悲しくならないかね？"),
    ],
    [
      gaster("normal", "値引きはできないのだよ。研究所も予算が厳しくてね。"),
      sans("awkward", "主にハカセのコーヒー代のせいでな"),
      gaster("angry", "コーヒーは研究に必要な経費だよ！"),
    ],
  ],
  // 回復アイテムを使ったとき
  heal: [
    [
      sans("laugh", "{item}で、ちょっとは元気が出たか？"),
      gaster("normal", "自尊心は大切にしたまえ、{name}君。"),
    ],
    [
      gaster("laugh", "ふむ。顔色が良くなったようだね。"),
      sans("normal", "自尊心ってのは、すり減ったら補充しないとな"),
    ],
    [
      sans("normal", "どうだ、{item}の味は"),
      gaster("normal", "回復したら、また仕事に戻るのだよ。"),
      sans("mock", "休ませる気はないってことだな", true),
    ],
    [
      gaster("normal", "少しは自分を褒めてあげたまえ。君はよくやっているよ。"),
      sans("awkward", "……ハカセがまともなこと言ってる"),
      gaster("angry", "私はいつもまともだよ！"),
    ],
  ],
  // 一時的な効果のアイテムを使ったとき
  buff: [
    [
      gaster("laugh", "{item}の効果はてきめんだよ。しばらくは期待していい。"),
      sans("normal", "効いてるうちに、タスクを片付けちまいな"),
    ],
    [
      sans("laugh", "おっ、{item}が効いてきたな"),
      gaster("normal", "効果は24時間だよ。時間を無駄にしないように。"),
    ],
    [
      gaster("mock", "ふむ……この効果、ぜひデータを取らせてもらいたいね。"),
      sans("awkward", "ハカセ、お客さんを実験台にするのはやめとけ"),
    ],
  ],
  // HP が満タンなのに回復アイテムを使おうとしたとき
  full: [
    [sans("mock", "HPはもう満タンだぜ。もったいないからとっときな", true)],
    [
      gaster("normal", "ふむ。今は回復の必要はないようだね。"),
      sans("normal", "ピンチになってから使いな"),
    ],
    [
      sans(
        "awkward",
        "満タンなのに食べるのか？ ……パピルスでもそこまで食い意地はってないぜ",
      ),
    ],
  ],
  // 使ったら HP が減ってしまったとき (パピルスのスパゲッティなど)
  hurt: [
    [
      sans("awkward", "……おっと、ハズレだったみたいだな"),
      gaster("awkward", "ふむ。{item}は当たり外れが大きいのだよ。"),
    ],
    [
      gaster("normal", "{name}君、顔色が悪いようだが……"),
      sans("mock", "パピルスには、うまかったって言っといてやるよ", true),
    ],
    [
      sans("normal", "まあ、気持ちはこもってるんだ。気持ちは"),
      gaster("awkward", "……気持ちでは、自尊心は回復しないのだがね。"),
    ],
  ],
  // 豆を挽きすぎたコーヒー: 画面がゆらゆら揺れる
  mysteryWobble: [
    [
      sans("awkward", "……おい、{name}。足元がふらついてるぜ"),
      gaster("laugh", "ふむ！ カフェインの過剰摂取による、興味深い反応だよ。"),
      sans("mock", "メモ取ってないで、水でも持ってきてやれよ", true),
    ],
    [
      gaster("awkward", "……サンズ君、研究所が揺れていないかね？"),
      sans("normal", "揺れてるのは{name}のほうだな。しばらくすれば治るぜ"),
    ],
  ],
  // 豆を挽きすぎたコーヒー: 虹色に見える
  mysteryRainbow: [
    [
      sans("laugh", "なんだかハカセが七色に光って見えるぜ"),
      gaster("laugh", "ふむ、ついに私の輝きが目に見えるようになったかね。"),
      sans("mock", "……いや、コーヒーのせいだろ", true),
    ],
    [
      gaster("normal", "{name}君、世界がカラフルに見えるかね？"),
      sans("normal", "白黒の研究所が、ちょっとはにぎやかになったな"),
    ],
  ],
  // 豆を挽きすぎたコーヒー: 揺れるうえに虹色
  mysteryBoth: [
    [
      sans("awkward", "揺れて、光って……{name}、大丈夫か？"),
      gaster("mock", "ふむ。二つの反応が同時に出るとは。実に興味深いね。"),
      sans("angry", "ハカセ、それ売り物にしちゃダメなやつだろ"),
    ],
  ],
  // 豆を挽きすぎたコーヒー: まれに起きる大当たり
  mysteryJackpot: [
    [
      gaster(
        "laugh",
        "なんと……！ これは、理論上しか存在しないはずの反応だよ！",
      ),
      sans("laugh", "HPも満タン、しばらく何もかも2倍だ。GOLDまでおまけだぜ"),
      gaster("laugh", "{name}君、この豆をどこで……いや、私が挽いたのだったね。"),
    ],
    [
      sans("awkward", "……おい、{name}が光ってるぞ"),
      gaster("laugh", "大当たりだよ！ 万に一つの奇跡的な抽出なのだよ！"),
      sans("mock", "同じのをもう一回いれてみろよ、ハカセ", true),
      gaster("awkward", "……どうやっていれたのか、覚えていないのだよ。"),
    ],
  ],
  // 店を出るとき
  leave: [
    [
      sans("normal", "またな、{name}"),
      gaster("normal", "シゴトに戻りたまえ。"),
    ],
    [
      gaster("laugh", "またのお越しを待っているよ。"),
      sans("laugh", "次はもっとGOLDを持ってきてくれよな"),
    ],
    [
      sans("normal", "がんばれよ。……ほどほどにな", true),
      gaster("normal", "期限は守るのだよ、{name}君。"),
    ],
  ],
};

export type ShopTalkKey = keyof typeof shopTalks;

// アイテムを選んだときの説明 (アイテムごとに複数のパターンから 1 つを選ぶ)
export const itemTalks: Record<string, ShopLine[][]> = {
  ketchup: [
    [
      sans("laugh", "オイラのおすすめだ。そのまま飲んでもうまいぜ"),
      gaster("awkward", "……サンズ君、それは飲み物ではないのだよ。"),
    ],
    [
      gaster("normal", "ふむ。ケチャップだね。トマトは栄養があるのだよ。"),
      sans("laugh", "研究所の在庫の半分はオイラが飲んでる"),
      gaster("angry", "だから在庫がすぐ無くなるのかね！"),
    ],
    [
      sans("normal", "安くて手軽に回復できる。初心者向けだな"),
      sans("mock", "ちなみにオイラはプロだから、ボトルごといく", true),
    ],
  ],
  coffee: [
    [
      gaster("laugh", "私が毎朝いれている特製コーヒーだよ。"),
      sans("mock", "カフェインで自尊心を取り戻すってわけだ", true),
    ],
    [
      sans("awkward", "ハカセの特製コーヒーだ。……味は保証しないぜ"),
      gaster("angry", "失礼な！ 豆の焙煎から研究しているのだよ。"),
    ],
    [
      gaster("normal", "一杯で目が覚め、二杯で頭が冴え、三杯目で……"),
      sans("normal", "三杯目で？"),
      gaster("awkward", "……手が震えるのだよ。"),
    ],
  ],
  butterscotchPie: [
    [
      gaster("laugh", "トリエル王妃からの差し入れだよ。お城で焼いたそうだ。"),
      sans("laugh", "バタースコッチとシナモンのいい匂いだぜ"),
      gaster("normal", "ふむ。研究所の皆に、と言付かっているのだよ。"),
    ],
    [
      sans("normal", "王妃さまのパイだ。アズゴア王も毎日食べてるらしいぜ"),
      gaster("laugh", "ふむ。お二人は今日も仲睦まじいようだね。"),
      sans("mock", "王さま、また紅茶の葉っぱの話でノロけてたらしいぜ", true),
    ],
    [
      gaster(
        "normal",
        "これは私も楽しみにしているのだよ。売り物にするのは心苦しいがね。",
      ),
      sans("mock", "じゃあ、なんで売ってるんだ？", true),
      gaster("awkward", "……研究費が足りないのだよ。"),
    ],
    [
      sans("laugh", "ひと口で、自尊心が全部戻ってくる味だ"),
      gaster("normal", "王妃の料理の腕は、王国でいちばんだからね。"),
      sans("normal", "パピルスにも作り方を教えてもらえないかな"),
      gaster("awkward", "……ふむ。まずは焦がさないところからだね。"),
    ],
  ],
  dinner: [
    [
      sans("normal", "がんばったごほうびだ。これを食えば全回復だぜ"),
      gaster("normal", "ふむ。食事は研究の基本だからね。"),
    ],
    [
      gaster(
        "laugh",
        "研究所の食堂の特別メニューだよ。私も月に一度の楽しみなのだ。",
      ),
      sans("mock", "ハカセ、月に一度しか食堂に行かないもんな", true),
    ],
    [
      sans("laugh", "今日はスパゲッティだ。パピルスが大好物なんだよな"),
      gaster("normal", "ふむ。彼もいつかは料理を覚えるのかね。"),
      sans("normal", "どうだろうな。……焦がさなきゃいいけどな"),
    ],
  ],
  switch: [
    [
      gaster("laugh", "押すとやる気が出るスイッチだよ。私の発明品さ。"),
      sans("awkward", "……それ、ただの電気のスイッチじゃないか？"),
    ],
    [
      sans("normal", "やる気スイッチだ。押すとEXPが2倍になる"),
      sans("mock", "オイラも押してみたけど、何も起きなかったぜ", true),
      gaster("awkward", "……君のスイッチは、壊れているのかもしれないね。"),
    ],
    [
      gaster("normal", "やる気というものは、外から入れることができるのだよ。"),
      sans("awkward", "そうなのか？"),
      gaster("laugh", "……ということにしておこう。"),
    ],
  ],
  bonus: [
    [
      gaster("normal", "これを出せば、しばらく報酬が2倍になるのだよ。"),
      sans("mock", "経理に怒られても知らないぜ", true),
    ],
    [
      sans("normal", "ボーナス申請書だ。ハカセのハンコ付きだぜ"),
      gaster("awkward", "……サンズ君、私はハンコを押した覚えがないのだが。"),
      sans("laugh", "ヘヘ、気のせいだろ"),
    ],
    [
      gaster("laugh", "GOLDが2倍になれば、コーヒー豆も2倍買えるのだよ。"),
      sans("awkward", "ハカセ、それお客さんの得の話じゃないだろ"),
    ],
  ],
  labcoat: [
    [
      sans("normal", "分厚い白衣だ。ダメージが半分になるぜ"),
      gaster("angry", "それは私の予備の白衣ではないかね！"),
    ],
    [
      gaster("normal", "実験の爆発にも耐える特別製だよ。"),
      sans("awkward", "……爆発する実験してるのか？"),
      gaster("awkward", "……たまにね。"),
    ],
    [
      sans("laugh", "これを着れば、シメキリの攻撃も半分だ"),
      sans(
        "mock",
        "サイズはハカセに合わせてあるから、ちょっと長いけどな",
        true,
      ),
    ],
  ],
  hotdog: [
    [
      sans("laugh", "オイラの得意料理だ。ちゃんと温めてあるぜ"),
      gaster("normal", "……サンズ君、そのホットドッグはどこで温めたのかね？"),
      sans("mock", "ハカセの実験用のバーナーで", true),
    ],
    [
      sans("normal", "ホットドッグだ。ケチャップは好きなだけかけていいぜ"),
      gaster("awkward", "君がかけると、パンが見えなくなるのだよ。"),
    ],
    [
      sans("normal", "ホットドッグはオイラの店の看板商品だ"),
      sans("mock", "……まあ、ここは研究所の売店なんだけどな", true),
      gaster("awkward", "いつから君の店になったのかね。"),
    ],
    [
      gaster(
        "normal",
        "ふむ。サンズ君、ホットドッグを頭に乗せて遊ぶのは禁止だよ。",
      ),
      sans("laugh", "ヘヘ、バランス感覚のトレーニングだぜ"),
      gaster("angry", "商品で遊ぶのはやめたまえ！"),
    ],
  ],
  spaghetti: [
    [
      sans("laugh", "パピルスが作ったスパゲッティだ。……最高の兄弟の手料理だぜ"),
      gaster(
        "awkward",
        "ふむ。味の再現性がまったくないのが、研究者として気になるがね。",
      ),
    ],
    [
      gaster("normal", "パピルス君のスパゲッティだね。毎回、味が違うのだよ。"),
      sans("mock", "当たればごちそう、外れれば……まあ、気持ちは伝わるさ", true),
    ],
    [
      sans("normal", "パピルスが朝から張り切って作ってたんだ"),
      gaster("normal", "ふむ。キッチンが少し焦げ臭かったのは、そのせいかね。"),
      sans("awkward", "……気にすんな"),
    ],
    [
      gaster("laugh", "このソースの配合は、研究する価値があるね。"),
      sans("mock", "毎回味が違うから、データは取れないぜ", true),
    ],
  ],
  strongCoffee: [
    [
      gaster(
        "laugh",
        "豆を限界まで挽いてみたのだよ。効果は……飲んでのお楽しみだ。",
      ),
      sans("awkward", "ハカセ、それ粉っていうより砂になってないか？"),
    ],
    [
      sans(
        "mock",
        "ハカセが三日寝ないで挽いた豆だ。何が起きても知らないぜ",
        true,
      ),
      gaster(
        "mock",
        "ふむ。ごくまれに、すばらしいことが起きる……という噂だよ。",
      ),
    ],
    [
      sans("awkward", "ハカセ、それ飲んで三日寝てないって本当か？"),
      gaster("laugh", "四日だよ、サンズ君。"),
      sans("angry", "自慢するところじゃないだろ"),
    ],
    [
      gaster(
        "normal",
        "飲んだ者には、世界が少しだけ違って見える。科学の神秘だよ。",
      ),
      sans("mock", "ただのカフェインの取りすぎだろ", true),
    ],
  ],
  cupNoodle: [
    [
      sans("normal", "研究所の夜食の定番だ。お湯を入れて3分だぜ"),
      gaster("normal", "ふむ。待っている3分で、論文が一本読めるのだよ。"),
    ],
    [
      gaster("awkward", "……サンズ君、私のカップめんを売り物にしていないかね？"),
      sans("mock", "名前、書いてなかったからな", true),
    ],
    [
      sans("laugh", "3分待つのが面倒なら、2分で食えばいいんだぜ"),
      gaster("awkward", "……それはまだ固いのではないかね。"),
    ],
    [
      gaster("normal", "ふむ。研究が忙しい夜には、これが一番なのだよ。"),
      sans("normal", "ハカセの夜食、ほぼ毎日これだよな"),
    ],
  ],
  donut: [
    [
      gaster("laugh", "近所のパン屋さんからの差し入れだよ。"),
      sans("normal", "穴があいてる分、カロリーは少なめってことにしとこうぜ"),
    ],
    [
      sans("laugh", "甘いもんは自尊心にきくんだ"),
      gaster("normal", "ふむ。糖分は脳の燃料でもあるのだよ。"),
    ],
    [
      gaster(
        "normal",
        "真ん中の穴には、熱を均一に通すための工夫があるのだよ。",
      ),
      sans("laugh", "へえ。オイラの目の穴にも理由があるのかな"),
      gaster("awkward", "……それは研究したことがないね。"),
    ],
    [
      sans("mock", "ハカセが半分かじったやつは、半額だぜ", true),
      gaster("angry", "かじっていないよ！"),
    ],
  ],
  boneCookie: [
    [
      sans("laugh", "ホネの形のクッキーだ。共食いじゃないぜ、念のため"),
      gaster("awkward", "……誰もそんなことは言っていないのだよ。"),
    ],
    [
      gaster("normal", "パピルス君が型を選んだそうだよ。"),
      sans("normal", "あいつ、ホネの形がかっこいいって言ってたな"),
    ],
    [
      gaster("laugh", "カルシウムたっぷりだよ。骨が丈夫になるのだ。"),
      sans("laugh", "ヘヘ、オイラはもう十分丈夫だぜ"),
    ],
    [
      sans("normal", "パピルスが一枚つまみ食いしてたな"),
      gaster("normal", "ふむ。味見も立派な研究だよ。"),
      sans("mock", "ハカセ、パピルスには甘いよな", true),
    ],
  ],
  iceCream: [
    [
      sans("normal", "ナイスクリームだ。冷たくて、頭がキーンとするぜ"),
      sans("mock", "……オイラは頭がホネだから、関係ないけどな", true),
    ],
    [
      gaster("normal", "研究所の冷凍庫で保存していたものだよ。"),
      sans("awkward", "サンプルと同じ冷凍庫なのは、ちょっと気になるけどな"),
    ],
    [
      sans("laugh", "包み紙に、ほめ言葉が書いてあるんだぜ"),
      gaster("laugh", "ふむ。『きみはよくがんばっている』……良い言葉だね。"),
      sans("mock", "ハカセ、自分に言われたと思ってるだろ", true),
    ],
  ],
  bigKetchup: [
    [
      sans("laugh", "業務用ケチャップだ。これ一本で一週間はもつぜ"),
      gaster("awkward", "……君なら三日でなくなるのだよ。"),
    ],
    [
      gaster("normal", "ふむ。普通のケチャップの四倍の量だよ。"),
      sans("mock", "つまり、四倍しあわせってことだな", true),
    ],
    [
      gaster("awkward", "サンズ君、なぜ業務用を仕入れたのかね。"),
      sans("laugh", "需要があるからさ。主にオイラの"),
    ],
    [
      sans("normal", "ボトルが重くて、持つのも一苦労だ"),
      sans("mock", "……まあ、オイラは筋肉がないからな", true),
      gaster("awkward", "骨しかないのだから当然だよ。"),
    ],
  ],
  pillow: [
    [
      sans("normal", "オイラ愛用のまくらだ。これがあればどこでも寝られる"),
      gaster("angry", "店番中も使っているから問題なのだよ！"),
    ],
    [
      sans("laugh", "ぐっすり寝れば、自尊心も満タンだ"),
      gaster(
        "normal",
        "ふむ。睡眠は大切だよ。……私も最後に寝たのはいつだったかね。",
      ),
    ],
    [
      gaster("normal", "このまくら、いつも君の机の上にあるね。"),
      sans("laugh", "仕事中も肌身離さず持ってるからな"),
      gaster("angry", "仕事中に使うのが問題なのだよ！"),
    ],
    [
      sans("normal", "ふかふかだぜ。これなら五分で寝られる"),
      gaster("mock", "ふむ。君なら三秒だろうね。"),
    ],
  ],
  alarm: [
    [
      gaster("normal", "めざまし時計だよ。早起きは三文の得なのだよ。"),
      sans("awkward", "……オイラは止めて二度寝する派だけどな"),
    ],
    [
      sans("normal", "ちょっとの間だけ、やる気が出る時計だ"),
      gaster("laugh", "鳴っている間だけね。"),
    ],
    [
      gaster("laugh", "私の発明品だよ。止めるまで鳴り続けるのだ。"),
      sans("awkward", "……オイラが毎朝、窓から投げてるやつだ"),
    ],
    [
      sans("normal", "朝が苦手なら、これ一つで大丈夫だ"),
      sans("mock", "オイラは三つあっても起きないけどな", true),
    ],
  ],
  energyDrink: [
    [
      gaster("laugh", "私の徹夜を支えてきたドリンクだよ。"),
      sans("mock", "ハカセのクマの原因でもあるけどな", true),
    ],
    [
      sans("awkward", "徹夜ドリンクだ。……飲みすぎるとハカセみたいになるぜ"),
      gaster("angry", "どういう意味かね、サンズ君！"),
    ],
    [
      gaster("normal", "成分の大半はカフェインだよ。私の血液と同じさ。"),
      sans("awkward", "……ハカセ、それ笑えないぜ"),
    ],
    [
      sans("laugh", "これを飲むと、ハカセみたいに目がギンギンになるぜ"),
      gaster(
        "normal",
        "ふむ。ほどほどにしておきたまえ。私のようにならないようにね。",
      ),
    ],
  ],
  oldCoin: [
    [
      gaster(
        "normal",
        "研究所の床下から出てきたコインだよ。幸運のお守りなのだ。",
      ),
      sans("normal", "床下で何してたんだ、ハカセ"),
    ],
    [
      sans("laugh", "持ってるとGOLDが寄ってくるらしいぜ"),
      gaster("mock", "ふむ。科学的な根拠はないがね。"),
    ],
    [
      sans("normal", "裏に変な記号が彫ってあるんだよな"),
      gaster("mock", "ふむ……それは私にも読めない文字だね。"),
      sans("awkward", "ハカセが読めないって、相当だぜ"),
    ],
    [
      gaster("laugh", "持ち主に富をもたらすと言われているのだよ。"),
      sans("mock", "じゃあ、なんでハカセはいつも金欠なんだ？", true),
      gaster("awkward", "……ふむ。"),
    ],
  ],
  stickyNotes: [
    [
      sans("normal", "付箋の束だ。シメキリを書いて貼っとけば、忘れないぜ"),
      gaster("awkward", "私の机は付箋だらけで、もう机が見えないのだよ。"),
    ],
    [
      gaster("normal", "やることを書き出すだけで、心の負担は軽くなるのだよ。"),
      sans("mock", "ハカセの心はもう付箋で埋まってそうだけどな", true),
    ],
    [
      sans("laugh", "オイラも使ってるぜ。「ヒルネ」って書いて貼ってある"),
      gaster("angry", "それはタスクではないのだよ！"),
    ],
    [
      gaster("normal", "色ごとに優先度を分けると、効率が上がるのだよ。"),
      sans("normal", "黄色しか持ってないけどな"),
    ],
  ],
  researchNote: [
    [
      gaster("laugh", "私の研究ノートだよ。読めば、きっと君の力になる。"),
      sans("awkward", "……字が読めればな"),
    ],
    [
      sans("normal", "ハカセの研究ノートだ。たまに変な記号で書いてあるぜ"),
      gaster(
        "mock",
        "ふむ。それは暗号なのだよ。……私にも読めないことがあるがね。",
      ),
    ],
    [
      sans("awkward", "ハカセ、大事なノートを売っていいのか？"),
      gaster("laugh", "ふむ。写しはまだ十冊あるのだよ。"),
    ],
    [
      gaster("normal", "ページの端に、サンズ君の落書きがあるがね。"),
      sans("mock", "サービスだ。価値が上がるぜ", true),
    ],
  ],
  sansJoke: [
    [
      sans("laugh", "オイラのとっておきのギャグだ。5Gぽっきりだぜ"),
      gaster("awkward", "……安いのには、理由があるのだよ。"),
    ],
    [
      sans("normal", "笑えば自尊心も回復するってもんだ"),
      gaster("normal", "ふむ。笑いの効果は、研究でも証明されているのだよ。"),
      sans("mock", "オイラのギャグで笑ったことないくせに", true),
    ],
    [
      gaster("mock", "サンズ君のギャグは、パピルス君には大人気らしいね。"),
      sans("laugh", "あいつはいい客だぜ。……毎回怒ってるけどな"),
    ],
  ],
  gasterJoke: [
    [
      gaster(
        "laugh",
        "私が三晩かけて考えたギャグだよ。値段は研究費込みだがね。",
      ),
      sans("mock", "150G……ハカセ、それ自分で言ってて笑えるか？", true),
      gaster("mock", "効果は保証するとも。……たぶんね。"),
    ],
    [
      sans("awkward", "高級品だ。……オイラは聞くたびに寒気がするけどな"),
      gaster(
        "angry",
        "知的な笑いというものは、分かる者にしか分からないのだよ！",
      ),
    ],
    [
      gaster("normal", "このギャグには、最新の研究成果がつまっているのだよ。"),
      sans("normal", "どんな研究だ？"),
      gaster("laugh", "人はどこまで寒いギャグに耐えられるか、だよ。"),
      sans("awkward", "……それ、売り物にしていいのか？"),
    ],
  ],
};

// ギャグのアイテムを使ったときの会話 (言うキャラごとに、毎回 1 つを選ぶ)
export const jokeTalks: Record<"sans" | "gaster", ShopLine[][]> = {
  sans: [
    [
      sans("normal", "なあ、ガイコツがケンカしない理由、知ってるか？"),
      sans("laugh", "ホネがないからさ……いや、ホネしかないか", true),
      gaster("awkward", "……ふむ。"),
    ],
    [
      sans("normal", "この研究所、寒いよな"),
      sans("laugh", "ホネの髄まで冷えるぜ。……ヘヘ", true),
      gaster("angry", "暖房費は削らないよ、サンズ君。"),
    ],
    [
      sans("laugh", "ハカセのコーヒー、またおかわりか？"),
      sans("mock", "カフェイン中毒ならぬ、カフェ因果応報だな", true),
      gaster("awkward", "……意味が分からないのだがね。"),
    ],
    [
      sans("normal", "ガイコツがパーティーに行かない理由、知ってるか？"),
      sans("laugh", "いっしょに行くボディがいないからさ", true),
      gaster("normal", "……ふむ。英語の辞書を引いておこう。"),
    ],
    [
      sans("normal", "このシメキリ、ホネが折れるな"),
      sans("mock", "……まあ、オイラのホネは丈夫だから大丈夫だけどな", true),
      gaster("awkward", "サンズ君、それは心配するところが違うのではないかね。"),
    ],
    [
      sans("laugh", "ハカセの白衣、いつも真っ白だよな"),
      sans("mock", "研究の結果も、いつも真っ白だけどな", true),
      gaster("angry", "サンズ君！！"),
    ],
  ],
  gaster: [
    [
      gaster("normal", "では、とっておきを披露しよう。"),
      gaster(
        "laugh",
        "原子を信用してはいけないよ。……なにせ、すべてを作り上げているからね。",
      ),
      sans("awkward", "…………"),
      sans("laugh", "ヘヘ、150Gの重みを感じるぜ", true),
    ],
    [
      gaster("laugh", "実験に失敗した化学者はどうなると思うかね？"),
      gaster("mock", "……反応がなくなるのだよ。"),
      sans("mock", "今のオイラみたいにな", true),
      gaster("angry", "サンズ君！"),
    ],
    [
      gaster("normal", "光と私の共通点を知っているかね？"),
      gaster("laugh", "どちらも、常に研究所を照らしているのだよ。"),
      sans("awkward", "……ハカセ、それはギャグじゃなくて自慢だ"),
    ],
    [
      gaster("laugh", "コーヒーとかけて、締め切りととく。"),
      sans("normal", "その心は？"),
      gaster("mock", "どちらも、こく（刻）一刻と迫ってくるのだよ。"),
      sans("laugh", "……ヘヘ、今のはちょっとよかったぜ", true),
    ],
    [
      gaster("normal", "重力の研究をしていたらね……"),
      gaster("laugh", "どうにも、その研究に引きこまれてしまったのだよ。"),
      sans("awkward", "…………パピルスなら笑ったかもな"),
      gaster("awkward", "……ふむ。対象年齢を見直す必要があるね。"),
    ],
  ],
};
