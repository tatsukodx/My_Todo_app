import type { Character, Expression } from "./characters";
import type { Todo } from "./types";

export type SceneKey =
  | "empty" // タスクが1件もない
  | "normal" // 未完了のタスクがある
  | "overdue" // 期限切れのタスクがある
  | "allDone" // すべて完了した
  | "added" // タスクを追加した
  | "completed" // タスクを1件完了した
  | "scheduled" // 後でやるタスクの日時を決めた
  | "damaged" // 期限切れでダメージを受けた
  | "levelUp"; // LV が上がった

export type DialogueLine = {
  speaker: Character;
  expression: Expression;
  text: string; // {count} は未完了タスクの件数に置き換わる
};

// 会話データを短く書くための関数
const sans = (expression: Expression, text: string): DialogueLine => ({
  speaker: "sans",
  expression,
  text,
});
const gaster = (expression: Expression, text: string): DialogueLine => ({
  speaker: "gaster",
  expression,
  text,
});

// 場面ごとに複数の会話パターンを用意し、場面が始まるたびに1つを選ぶ
// 【設定メモ】
// - パピルス(サンズの弟)はこのころはまだ子供で、研究室にはいない。サンズがたまに話題にする
// - ガスターはコーヒー(カフェイン)が好きで、毎日のように飲んでいる
export const scenes: Record<SceneKey, DialogueLine[][]> = {
  empty: [
    [
      sans("normal", "ハカセ、タスクがひとつもないぜ"),
      gaster(
        "laugh",
        "ふむ。では、まずタスクを作るところから研究しようじゃないかね？",
      ),
      sans(
        "smirk",
        "ヘヘ、シゴトを探すシゴトかい。そいつはホネが折れそうだな。なんせホネしかないもんで",
      ),
    ],
    [
      gaster("normal", "ふむ。今日はやることが何もないようだ。"),
      sans("laugh", "ヘヘ、そいつは何よりだな。　ヒルネの研究でもするか？"),
      gaster("awkward", "……それは...実に興味深いね。"),
    ],
    [
      sans("normal", "……"),
      gaster("normal", "サンズ君、なぜ黙っているのかい？"),
      sans("smirk", "ヘヘ、何か言うとシゴトが増えそうだからな"),
    ],
    [
      gaster("normal", "サンズ君、タスク一覧が空っぽだよ。"),
      sans("laugh", "ヘヘ、オイラの頭ん中とおんなじだな"),
      gaster(
        "awkward",
        "……君の頭の中には、少しは何か入っていてほしいのだがね。",
      ),
    ],
    [
      sans("normal", "なあハカセ、ヒマだな"),
      gaster("smirk", "暇とは、新しい仕事が生まれる前の静けさなのだよ。"),
      sans("awkward", "……コワいこと言うなよ"),
    ],
    [
      gaster("laugh", "サンズ君！ 今こそ新しいタスクを登録する好機だ！"),
      sans("normal", "右下の＋ボタンを押せばいいんだろ？"),
      gaster("normal", "……そのとおり。説明の手間が省けたよ。"),
      sans("smirk", "ヘヘ、オイラもたまには役に立つだろ"),
    ],
    [
      sans("smirk", "ハカセ、今日は何の研究もないのかい？"),
      gaster("awkward", "……予算が下りなくてね。"),
      sans("laugh", "ヘヘ、そいつはお気の毒サマ"),
    ],
    [
      gaster("normal", "やることがない日は、何をするべきだと思うかね？"),
      sans("laugh", "決まってるだろ。ホットドッグ食って昼寝だ"),
      gaster("sad", "……実に君らしい答えだね。"),
    ],
    [
      sans("laugh", "ハカセ、今日はタスクゼロだぜ"),
      gaster("normal", "ふむ。では「ゼロ」という数について考察しようか。"),
      sans("awkward", "……ヒマつぶしのスケールがでかすぎるだろ"),
    ],
    [
      gaster(
        "smirk",
        "サンズ君、予定がないのなら私の実験を手伝ってくれたまえ。",
      ),
      sans("normal", "あー……今ちょうど予定ができたとこだ"),
      gaster("awkward", "……何の予定かね？"),
      sans("smirk", "ヒルネ"),
    ],
    [
      sans("normal", "まっさらなリストってのは、気持ちいいもんだな"),
      gaster("laugh", "ああ。何でも書き込める、可能性に満ちた空白だ。"),
      sans("smirk", "ヘヘ、オイラは何も書かない可能性に賭けるぜ"),
    ],
    [
      gaster("normal", "サンズ君、タスクが無いというのは本当かね？"),
      sans("normal", "……なんだよ急に"),
      gaster("smirk", "忘れているだけ、という可能性もあるだろう？"),
      sans("awkward", "……やめてくれ、思い出しそうになる"),
    ],
    [
      sans("smirk", "なあハカセ。ヒマすぎてガイコツになっちまいそうだ"),
      gaster("awkward", "……サンズ君、君はもともと骨だよ。"),
      sans("laugh", "ヘヘ、バレたか"),
    ],
    [
      sans("normal", "ハカセ、ヒマなら早めに帰っていいか？"),
      gaster("normal", "ふむ。何か用事でもあるのかね？"),
      sans("laugh", "パピルスに絵本を読んでやるって約束してるんだ"),
      gaster("laugh", "……それは、何よりも大事な用事だね。"),
    ],
    [
      gaster("laugh", "サンズ君、やることがないならコーヒーでも淹れようか。"),
      sans("smirk", "ハカセ、それ今日何杯目だ？"),
      gaster("awkward", "……数えるのはやめたよ。"),
    ],
    [
      sans("smirk", "パピルスのやつ、昨日オイラにタスク表を作ってくれたんだぜ"),
      gaster("normal", "ほう。どんな内容かね？"),
      sans("laugh", "「1. ねる　2. おきる　3. スパゲッティ」"),
      gaster("laugh", "……完璧なタスク管理だね。見習いたいよ。"),
    ],
  ],
  normal: [
    [
      gaster("normal", "サンズ君、残っているタスクは{count}件だよ。"),
      sans("normal", "ヘッ……今日もザンギョーコースだな"),
      gaster("laugh", "残業ではない、研究だよ。"),
      sans("smirk", "……なるほどな。　給料が出ない方ってわけか"),
    ],
    [
      sans("normal", "ハカセ、残りはあと{count}件だぜ"),
      gaster(
        "normal",
        "仕方ない。では、すべて同時に片付ける装置を作ろうじゃないか",
      ),
      sans("smirk", "ヘヘ、そのソウチを作るのが一番時間かかりそうだけどな"),
      gaster("awkward", "……まあ。"),
    ],
    [
      gaster("laugh", "サンズ君、私に良い考えがあるのだが。"),
      sans("awkward", "……イヤなヨカンしかしねえな"),
      gaster(
        "normal",
        "タスクの名前を全部「完了」に書き換える、というのはどうかね？",
      ),
      sans("angry", "アホか。それはただのズルだろ"),
    ],
    [
      gaster("normal", "サンズ君、タスクがまだ{count}件残っているようだね。"),
      sans("awkward", "……見なかったことにしていいか？"),
      gaster("angry", "いいわけがないだろう。"),
      sans("smirk", "ヘヘ、言ってみただけだって"),
    ],
    [
      sans("normal", "ハカセ、どれから手をつけりゃいい？"),
      gaster("normal", "ふむ。期限が近いものから片付けるのが定石だよ。"),
      sans("laugh", "ヘヘ、たまにはマトモなこと言うじゃねえか"),
      gaster("awkward", "……「たまには」とは心外だね。"),
    ],
    [
      gaster(
        "laugh",
        "サンズ君、{count}件のタスクを一瞬で終わらせる方法を思いついたよ。",
      ),
      sans("normal", "へえ、どうすんだ？"),
      gaster("normal", "君が今すぐ全部やるのだ。"),
      sans("angry", "それはホウホウじゃなくてメイレイだろ"),
    ],
    [
      sans("smirk", "ハカセ、キューケイってジッケンはしねえのか？"),
      gaster(
        "normal",
        "休憩の効果は、タスクを終えたあとに検証しようではないか。",
      ),
      sans("awkward", "……そのジッケン、いつまでたっても始まらねえな"),
    ],
    [
      gaster("normal", "残り{count}件か。計算上、今日中に終わる見込みだよ。"),
      sans("smirk", "ヘヘ、ハカセのケイサンが当たったことあったっけか？"),
      gaster("awkward", "…………"),
    ],
    [
      sans("normal", "{count}件か……"),
      gaster("normal", "どうしたのだね、サンズ君。"),
      sans("laugh", "いや、数えただけでツカれちまってな"),
      gaster("angry", "まだ何も始めていないではないか。"),
    ],
    [
      gaster("normal", "サンズ君、{count}件のタスクが君を待っているよ。"),
      sans("smirk", "ヘヘ、待たせとけばいいさ。オイラは待たせるのが得意でね"),
      gaster("angry", "それは自慢することではないよ。"),
    ],
    [
      sans("normal", "ハカセ、ちょっとだけ休んでいいか？"),
      gaster("normal", "ふむ。どれくらいかね？"),
      sans("laugh", "ちょっとだけ。…そうだな、三時間くらい"),
      gaster("angry", "それは「ちょっと」とは言わないよ、サンズ君。"),
    ],
    [
      gaster("laugh", "サンズ君、タスクは一つずつ片付ければ必ず終わるのだよ。"),
      sans("normal", "へえ。じゃあ一つもやらなきゃ？"),
      gaster("awkward", "……永遠に終わらないね。"),
      sans("smirk", "ヘヘ、エイエンってのもロマンがあるだろ"),
    ],
    [
      sans("awkward", "ハカセ、{count}件ってのは多いのか少ないのか？"),
      gaster("normal", "やる気次第で、どちらにもなるのだよ。"),
      sans("smirk", "ヘヘ、じゃあ今のオイラにはオオすぎるな"),
    ],
    [
      gaster("normal", "サンズ君、集中力を高める装置を作ってみたのだが。"),
      sans("normal", "へえ、どんなだ？"),
      gaster("laugh", "このタイマーが鳴るまで、ひたすら作業するのだ。"),
      sans("awkward", "……それ、ただのタイマーだろ"),
    ],
    [
      sans("smirk", "ハカセ、オイラいい作戦思いついたぜ"),
      gaster("normal", "ほう、聞かせてくれたまえ。"),
      sans("laugh", "明日のオイラに全部任せる"),
      gaster("sad", "……明日の君が気の毒だよ。"),
    ],
    [
      gaster("normal", "残り{count}件か。まずはコーヒーで頭を冴えさせようか。"),
      sans("smirk", "ハカセはコーヒー飲まないと動かねえもんな"),
      gaster("awkward", "……カフェインは研究者の燃料なのだよ。"),
    ],
    [
      sans("normal", "さっさと終わらせて帰らねえとな"),
      gaster("normal", "おや、今日はやる気だね。"),
      sans("laugh", "パピルスが晩メシ作って待ってるって言うんでな"),
      gaster("normal", "ふむ。ちなみに、何を作ってくれるのかね？"),
      sans("smirk", "スパゲッティ。たぶん、コゲてるやつ"),
    ],
    [
      gaster("sad", "サンズ君……コーヒーが切れてしまった。"),
      sans("awkward", "ハカセ、タスクより深刻そうな顔してるぜ"),
      gaster(
        "normal",
        "当然だよ。カフェインなしでは{count}件も片付かないからね。",
      ),
      sans("smirk", "ヘヘ、じゃあ先に「豆の買い出し」をタスクに入れとくか"),
    ],
  ],
  overdue: [
    [
      gaster("sad", "サンズ君……期限を過ぎたタスクがあるようだよ。"),
      sans(
        "smirk",
        "ヘヘ、時間を巻き戻すソウチでも作るかい、偉大なるガスター博士サマよぉ？",
      ),
      gaster("awkward", "……まあ、それには別の予算が必要だがね。"),
      sans(
        "smirk",
        "へへ、ヨサンの前に、シメキリを守る研究から始めた方がいいとおもいますぜ",
      ),
    ],
    [
      sans("awkward", "なあハカセ……シメキリ、過ぎてるぜ"),
      gaster("normal", "サンズ君。締切とは、過ぎてからが本番ではないのかね？"),
      sans("angry", "ホンバンはとっくに終わってるだろ"),
    ],
    [
      gaster("angry", "サンズ君！ 期限切れのタスクがあるではないか！"),
      sans(
        "smirk",
        "ヘヘ、それ、ハカセが「後でやる」って言ってたやつじゃねえか",
      ),
      gaster("awkward", "…………興味深い。"),
    ],
    [
      gaster("angry", "サンズ君、期限とは守るためにあるものだよ。"),
      sans("smirk", "ヘヘ、オイラは破るためにあるもんだと思ってたぜ"),
      gaster("sad", "……君とは一度、じっくり話し合う必要がありそうだね。"),
    ],
    [
      sans("awkward", "ハカセ……このタスク、日付がもう過去になってるぜ"),
      gaster("normal", "ふむ。時間とは不可逆なものだからね。"),
      sans("smirk", "ヘヘ、ムズカしく言ってもチコクはチコクだぜ"),
      gaster("awkward", "……反論の余地がないね。"),
    ],
    [
      gaster("sad", "サンズ君……私たちは時間に負けてしまったようだ。"),
      sans("normal", "まだ負けちゃいねえよ。今からやりゃいいだろ"),
      gaster("laugh", "……ふむ！ 君にしては前向きだね。"),
      sans("smirk", "ヘヘ、まあ、やるのはアンタだけどな"),
    ],
    [
      sans("angry", "おいハカセ！ シメキリ過ぎてるじゃねえか！"),
      gaster("awkward", "……サンズ君、そのタスクの担当は君だったはずだが。"),
      sans("awkward", "……………"),
      sans("smirk", "ヘヘ、今のはナシで頼むぜ"),
    ],
    [
      gaster("normal", "サンズ君、期限を延ばす方法を知っているかね？"),
      sans("normal", "知ってたらとっくにやってるぜ"),
      gaster("smirk", "答えは簡単。期限の日付を書き換えればよいのだよ。"),
      sans("angry", "それはズルって言うんだぜ、ハカセ"),
    ],
    [
      gaster("awkward", "サンズ君……このタスク、期限を少々過ぎているようだが。"),
      sans("normal", "ショウショウってどれくらいだ？"),
      gaster("awkward", "……詳しくは言わないでおこう。"),
      sans("awkward", "……そいつはヤバそうだな"),
    ],
    [
      sans("smirk", "ハカセ、シメキリってのはな、目安なんだぜ"),
      gaster("angry", "違う。締切は締切だよ、サンズ君。"),
      sans("awkward", "……へい"),
    ],
    [
      gaster("normal", "時間を巻き戻す研究は、まだ完成していないのだよ。"),
      sans("normal", "じゃあどうすんだ？"),
      gaster("laugh", "簡単なことだ。今すぐ取りかかればいい。"),
      sans("smirk", "ヘヘ、結局それかよ"),
    ],
    [
      sans("awkward", "なあハカセ、期限切れのやつ、見なかったことにしねえか？"),
      gaster("normal", "見なかったことにしても、タスクは消えないのだよ。"),
      sans("smirk", "ヘヘ、タスクってのはシツコいもんだな"),
    ],
    [
      gaster("angry", "サンズ君！ いつまで期限切れを放っておくつもりだね！"),
      sans("normal", "まあまあハカセ、落ち着けって"),
      gaster("normal", "……ふむ。では落ち着いて、一緒に片付けようか。"),
      sans("laugh", "ヘヘ、そうこなくっちゃ"),
    ],
    [
      sans("awkward", "やべえ……シメキリ過ぎてるぜ"),
      gaster("normal", "ふむ。今夜はコーヒーを多めに用意しておこう。"),
      sans("smirk", "ヘヘ、テツヤする気マンマンだな"),
      gaster("laugh", "研究者の夜は長いのだよ。"),
    ],
    [
      gaster("angry", "サンズ君、期限切れのタスクがあるよ。"),
      sans(
        "smirk",
        "ヘヘ、パピルスにも言われたぜ。「シュクダイは先にやれ」ってな",
      ),
      gaster("awkward", "……君は弟に叱られているのかね。"),
      sans("laugh", "アイツ、オイラよりしっかりしてるからな"),
    ],
  ],
  allDone: [
    [
      sans("laugh", "おいハカセ。　全部終わったぜ"),
      gaster(
        "smirk",
        "ふむ。…では、次の研究テーマを十個ほど用意してあるのだが…。",
      ),
      sans("angry", "冗談だろ。　ジョークを言うのアンタじゃねえよ"),
    ],
    [
      gaster("laugh", "…素晴らしいよサンズ君！ すべて完了だ。"),
      sans("laugh", "ヘヘ、たまにはホメられるのも悪くねえな"),
      gaster(
        "normal",
        "ふむ。ではお祝いとして、新しい実験を始めようじゃないかね？",
      ),
      sans("awkward", "……じゃあホメんな。"),
    ],
    [
      sans("laugh", "ヘヘ、今日のシゴトはおしまいだな"),
      gaster("sad", "……ふむ。少し寂しい気もするがね。"),
      sans("smirk", "……んなら、机のショルイの山でも片付けたらどうだい"),
    ],
    [
      gaster("laugh", "すばらしい！ 未完了のタスクはゼロだよ、サンズ君！"),
      sans("laugh", "ヘヘ、オイラだってやるときはやるんだぜ"),
      gaster("smirk", "ふむ。普段からやってくれると、もっと嬉しいのだがね。"),
      sans("awkward", "……ヒトコト多いぜ"),
    ],
    [
      sans("normal", "ハカセ、全部終わったし帰っていいか？"),
      gaster("normal", "ふむ。……ところで、明日の分のタスクなのだが。"),
      sans("angry", "聞こえなかったことにするぜ"),
    ],
    [
      gaster("normal", "サンズ君、すべてのタスクが完了したね。"),
      sans("smirk", "ああ。ヒマすぎてホネが鳴るぜ"),
      gaster("awkward", "……それは単に運動不足ではないかね？"),
    ],
    [
      sans("laugh", "見ろよハカセ、チェックだらけだぜ"),
      gaster("laugh", "ああ、実に美しい光景だね。"),
      sans("smirk", "ヘヘ、アンタの実験ノートもこれくらいキレイならな"),
      gaster("awkward", "……それは言わない約束だよ。"),
    ],
    [
      gaster("sad", "……サンズ君、もうやることがないのかね？"),
      sans("normal", "ああ、ないぜ"),
      gaster("laugh", "では、やることを作ろう！"),
      sans("angry", "やめろ"),
    ],
    [
      sans("laugh", "ハカセ、ゼンブ終わったぜ。ホネ休めしてもいいよな？"),
      gaster("laugh", "ああ、今日はゆっくり休みたまえ。"),
      sans("awkward", "……やけにヤサしいな。何かウラがあるだろ"),
      gaster("smirk", "ふふ、さあ、どうだろうね。"),
    ],
    [
      gaster("normal", "すべて完了か。記録として残しておこう。"),
      sans("smirk", "ヘヘ、めったにないキロクだからな"),
      gaster("awkward", "……そこは否定してほしかったね。"),
    ],
    [
      sans("normal", "ハカセ、タスク全部片付いたぜ"),
      gaster("laugh", "おめでとう、サンズ君。何かお祝いをしようか。"),
      sans("laugh", "ヘヘ、じゃあホットドッグおごってくれよ"),
      gaster("normal", "ふむ。予算の範囲内でね。"),
    ],
    [
      gaster("laugh", "今日の研究成果は上々だね、サンズ君。"),
      sans("smirk", "ヘヘ、研究っつーか、ただのザツヨウだけどな"),
      gaster("normal", "雑用も立派な研究の一部なのだよ。"),
    ],
    [
      sans("smirk", "全部終わったってのに、ハカセはまだ帰らねえのか？"),
      gaster("normal", "研究者に終業時間はないのだよ。"),
      sans("awkward", "……ブラックだな"),
    ],
    [
      sans("laugh", "全部終わったし、パピルスを迎えに行ってくるぜ"),
      gaster("normal", "ふむ。パピルス君によろしく伝えてくれたまえ。"),
      sans("smirk", "ヘヘ、アイツ「ハカセはコーヒーくさい」って言ってたぜ"),
      gaster("awkward", "…………気をつけるよ。"),
    ],
    [
      gaster("laugh", "すべて完了だ！ 祝杯としてコーヒーを淹れよう。"),
      sans("smirk", "ハカセ、それいつものコーヒーだろ"),
      gaster("normal", "気持ちの問題なのだよ、サンズ君。"),
    ],
  ],
  added: [
    [
      gaster("laugh", "新しいタスクだね。実に興味深いとは思わないかね？"),
      sans(
        "smirk",
        "ええ、実にキョーミ深いですぜ。　シゴトが減るどころか増えていくシクミがね",
      ),
    ],
    [
      sans("awkward", "……おいハカセ、また増えたぜ？"),
      gaster("normal", "サンズ君。仕事とは、増えるものなのだよ。"),
      sans("smirk", "ヘヘ、アンタの白衣のシミみたいにか？"),
    ],
    [
      gaster("normal", "…この案件は君に任せるよ、サンズ君。"),
      sans("smirk", "ヘッ、ハカセの「任せる」は「全部やれ」って意味だろ？"),
    ],
    [
      sans("normal", "ハカセ、なんか増えたぜ"),
      gaster("laugh", "ふむ。研究対象が増えるのは喜ばしいことだよ。"),
      sans("awkward", "オイラにとってはカナしいことだけどな"),
    ],
    [
      gaster("normal", "サンズ君、新しいタスクを記録しておいたよ。"),
      sans("smirk", "ヘヘ、キロクするだけならカンタンだよな"),
      gaster("awkward", "……実行は、まあ、君に任せるとしよう。"),
    ],
    [
      sans("smirk", "おっと、新入りのタスクだな"),
      gaster("normal", "丁寧に扱ってくれたまえ。"),
      sans("laugh", "ヘヘ、ホネ身を削ってがんばるぜ"),
      gaster("awkward", "……削れるほど残っているのかね？"),
    ],
    [
      gaster("laugh", "タスクがひとつ増えたね！"),
      sans("normal", "これで残りは{count}件か"),
      gaster("normal", "ふむ。数字は正直だね。"),
      sans("awkward", "……正直すぎてツラいぜ"),
    ],
    [
      sans("normal", "ハカセ、これ本当にやるのか？"),
      gaster("normal", "予定は未定。しかし、記録は確定だよ。"),
      sans("smirk", "ヘヘ、ウマいこと言ったつもりかい"),
    ],
    [
      gaster("normal", "サンズ君、タスクを追加しておいたよ。"),
      sans("normal", "へいへい。ちゃんと期限も決めたか？"),
      gaster("awkward", "……今から決めるところだよ。"),
    ],
    [
      sans("awkward", "また増えてる……"),
      gaster("laugh", "タスクは研究の種だよ、サンズ君。"),
      sans("smirk", "ヘヘ、タネまきすぎて畑からあふれてるぜ"),
    ],
    [
      gaster("laugh", "サンズ君、新しいタスクだ！ 心が躍るね！"),
      sans("normal", "オイラのホネは震えてるけどな"),
      gaster("awkward", "……それは武者震いということにしておこう。"),
    ],
    [
      sans("normal", "ハカセ、そのタスク誰がやるんだ？"),
      gaster("normal", "もちろん、我々二人でだよ。"),
      sans("smirk", "ヘヘ、で、ハカセは何するんだ？"),
      gaster("normal", "……監督だね。"),
    ],
    [
      gaster("normal", "これで残りは{count}件だね。"),
      sans("smirk", "増やしたのはアンタだけどな"),
      gaster("laugh", "ふふ、仕事を生み出すのも才能なのだよ。"),
    ],
    [
      gaster("normal", "サンズ君、「コーヒー豆を買う」を追加しておいたよ。"),
      sans("awkward", "……それ、研究と関係あるのか？"),
      gaster("angry", "大いにあるとも。カフェインなくして研究なしだ。"),
    ],
    [
      sans("normal", "ハカセ、これはオイラの個人的なタスクなんだけどさ"),
      gaster("normal", "ほう。何かね？"),
      sans("laugh", "「パピルスの誕生日プレゼントを買う」"),
      gaster("laugh", "……ふむ。それは期限厳守で頼むよ。"),
    ],
  ],
  completed: [
    [
      sans("laugh", "ひとつ片付いたぜ、ハカセ"),
      gaster("normal", "よくやったよ、サンズ君。　だが残りは{count}件だがね。"),
      sans(
        "smirk",
        "…へへ。　アンタの「よくやった」は、あんまり信用できねえな",
      ),
    ],
    [
      gaster("laugh", "…見事だよ、サンズ君。"),
      sans("laugh", "ヘヘ、もっとホメてくれてもいいんだぜ？"),
      gaster("normal", "では、ご褒美にこちらのタスクを……"),
      sans("angry", "…面白いジョークだな"),
    ],
    [
      sans("normal", "終わったぜ"),
      gaster("normal", "ふむ。"),
      sans("awkward", "……それだけかよ"),
    ],
    [
      gaster("laugh", "おお、タスクがひとつ片付いたね！"),
      sans("smirk", "ヘヘ、オイラにかかればこんなもんだ"),
      gaster("normal", "この調子で、残りの{count}件も頼むよ。"),
      sans("awkward", "……チョーシに乗るんじゃなかったぜ"),
    ],
    [
      sans("laugh", "ヒトツ終わったぜ、ハカセ"),
      gaster("normal", "ふむ。所要時間を記録しておこう。"),
      sans("awkward", "……そういうのはハカらなくていいんだよ"),
    ],
    [
      gaster("normal", "サンズ君、完了の手応えはどうかね？"),
      sans("laugh", "ヘヘ、ホネにしみるぜ"),
      gaster("awkward", "……骨に、かね。"),
    ],
    [
      sans("normal", "よし、チェックっと"),
      gaster("laugh", "実に良い音だ。完了の音だね。"),
      sans("smirk", "ヘヘ、ハカセ、チェックに音なんかしねえよ"),
    ],
    [
      gaster("smirk", "サンズ君。今のタスク、本当に終わったのかね？"),
      sans("angry", "ちゃんと終わらせたっての"),
      gaster("laugh", "ふふ、冗談だよ。よくやったね。"),
      sans("awkward", "……アンタのジョークはわかりにくいんだよ"),
    ],
    [
      sans("laugh", "よっしゃ、またヒトツ終わったぜ"),
      gaster("laugh", "素晴らしい！ 残りは{count}件だ。"),
      sans("awkward", "……残りの数は言わなくていいんだよ"),
    ],
    [
      gaster("normal", "サンズ君、今のタスクはどうだったかね？"),
      sans("smirk", "ヘヘ、思ったよりカンタンだったぜ"),
      gaster("smirk", "では、次はもっと難しいものを用意しよう。"),
      sans("angry", "そういう意味じゃねえよ"),
    ],
    [
      sans("normal", "ハカセ、完了にするのってクセになるな"),
      gaster("laugh", "ふむ。それが達成感というものだよ。"),
      sans("smirk", "ヘヘ、完了にするとこだけやらせてくれりゃ最高なんだけどな"),
    ],
    [
      gaster("laugh", "サンズ君、君の働きぶりを論文にまとめたいくらいだよ。"),
      sans("smirk", "ヘヘ、タイトルは「ホネ折り損のくたびれもうけ」で頼むぜ"),
      gaster("awkward", "……縁起でもないね。"),
    ],
    [
      sans("laugh", "ほらハカセ、終わらせてやったぜ"),
      gaster("normal", "ふむ。君ならやれると思っていたよ。"),
      sans("awkward", "……急にホメられると調子くるうな"),
    ],
    [
      sans("laugh", "ヒトツ終わったぜ。パピルスに自慢してやろ"),
      gaster("normal", "ふふ、パピルス君は喜んでくれるかね？"),
      sans("smirk", "ヘヘ、「ニイチャンすごい！」って言ってくれるさ"),
    ],
    [
      gaster("laugh", "よくやった、サンズ君。ご褒美にコーヒーを一杯どうかね？"),
      sans("awkward", "オイラ、ケチャップの方がいいんだけど"),
      gaster("awkward", "……それは飲み物ではないよ。"),
    ],
  ],
  scheduled: [
    [
      sans("normal", "ハカセ、後回しにしてたやつの日時が決まったぜ"),
      gaster("laugh", "ふむ。ついに観測可能になったというわけだね。"),
      sans("smirk", "ヘヘ、カンソクできたところで、やるのはこっちなんだけどな"),
    ],
    [
      gaster("normal", "サンズ君。その件、いつやるか決めたのかね？"),
      sans("normal", "ああ、ちゃんと決めたぜ"),
      gaster("smirk", "…ほう。君にしては珍しいね。"),
      sans("angry", "アンタにだけは言われたくねえな"),
    ],
    [
      sans("laugh", "ヘヘ、ヨテイが決まったぜ、ハカセ"),
      gaster(
        "normal",
        "ふむ。では、その日までに終わる確率を計算しようじゃないか。",
      ),
      sans("awkward", "…そのケイサンしてる間にシメキリが来ちまうだろ"),
    ],
    [
      gaster("normal", "ふむ。いつやるかが決まったようだね。"),
      sans("laugh", "ヘヘ、決めただけでやった気になるな"),
      gaster("angry", "それは錯覚だよ、サンズ君。"),
    ],
    [
      sans("normal", "ヨテイに入れといたぜ"),
      gaster("laugh", "素晴らしい。未来の君に期待しよう。"),
      sans("smirk", "ヘヘ、ミライのオイラもきっとサボるぜ"),
      gaster("awkward", "……それは観測したくない未来だね。"),
    ],
    [
      gaster("normal", "サンズ君、その日時で本当に大丈夫かね？"),
      sans("normal", "ああ、たぶんな"),
      gaster("sad", "……その「たぶん」が一番不安なのだよ。"),
    ],
    [
      sans("smirk", "ヨテイ決めたからには、その日まで休んでいいよな？"),
      gaster("normal", "ふむ。その理屈は……一応、筋は通っているね。"),
      sans("laugh", "ヘヘ、だろ？"),
      gaster("angry", "いや、通っていない。他のタスクがあるだろう。"),
    ],
    [
      sans("normal", "ハカセ、ヨテイ入れといたぜ"),
      gaster("normal", "ふむ。その日の君がやる気に満ちていることを願うよ。"),
      sans("smirk", "ヘヘ、そいつは当日のオイラ次第だな"),
    ],
    [
      gaster("laugh", "日時が決まったね。これで計画は完璧だ。"),
      sans("smirk", "ヘヘ、計画だけはいつもカンペキだよな"),
      gaster("awkward", "……実行も完璧にしたいものだね。"),
    ],
    [
      sans("normal", "後回しにしてたやつ、やっと日にちが決まったぜ"),
      gaster("normal", "ふむ。後回しの後回しにならないよう祈っているよ。"),
      sans("awkward", "……耳がイタいぜ"),
    ],
    [
      gaster("normal", "サンズ君、その日は他に予定はないのかね？"),
      sans("normal", "あー……ヒルネの予定ならあるな"),
      gaster("angry", "それは予定とは言わないよ。"),
    ],
    [
      sans("smirk", "ヨテイを決めるのは得意なんだよな"),
      gaster("normal", "ふむ。守るのはどうかね？"),
      sans("laugh", "ヘヘ、それはまた別のハナシだ"),
    ],
    [
      sans("normal", "その日はパピルスの用事があるから、別の日にしたぜ"),
      gaster("normal", "ふむ。家族の予定は優先すべきだね。"),
      sans("laugh", "ヘヘ、ハカセにしちゃ話がわかるじゃねえか"),
    ],
    [
      gaster(
        "normal",
        "その日は朝から取りかかろう。コーヒーは三杯用意しておくよ。",
      ),
      sans("smirk", "三杯で足りるのか？"),
      gaster("awkward", "……五杯にしておこう。"),
    ],
  ],
  damaged: [
    [
      sans("awkward", "おっと……シメキリが過ぎて、自尊心がけずれたぜ"),
      gaster("sad", "ふむ。期限切れは、心に効くのだよ。"),
      sans("smirk", "ハカセのは、もう削れるところが残ってないんじゃないか？"),
      gaster("angry", "サンズ君！"),
    ],
    [
      gaster("awkward", "……サンズ君、今の音は何かね？"),
      sans("normal", "シメキリが破れた音だな。HPが減ってるぜ"),
      gaster("normal", "ショップで回復しておくといい。コーヒーもあるのだよ。"),
    ],
  ],
  levelUp: [
    [
      sans("laugh", "おっ、LVが上がったぜ"),
      gaster("laugh", "ふむ！ 素晴らしい成長だよ。研究対象にしたいくらいだ。"),
      sans("smirk", "ヘヘ、解剖はかんべんしてくれよ"),
    ],
    [
      gaster("normal", "経験を積むと、自尊心も大きくなるのだよ。"),
      sans("normal", "最大HPが上がったってことだな"),
      gaster("laugh", "では、次の課題も期待しているよ。"),
      sans("awkward", "……ホメたあとに仕事を増やすのはやめてくれ"),
    ],
  ],
};

// 操作をしていないときに表示する場面を、Todo の状態から決める
export const getStatusScene = (todos: Todo[]): SceneKey => {
  if (todos.length === 0) {
    return "empty";
  }
  const uncompletedTodos = todos.filter((todo) => !todo.isDone);
  if (uncompletedTodos.length === 0) {
    return "allDone";
  }
  const now = new Date();
  const hasOverdue = uncompletedTodos.some(
    (todo) => todo.deadline !== null && todo.deadline < now,
  );
  if (hasOverdue) {
    return "overdue";
  }
  return "normal";
};
