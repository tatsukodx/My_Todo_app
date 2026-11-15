// 予定 (習い事など) の、始まる日時と終わる日時
export type TodoEvent = {
  start: Date;
  end: Date;
};

export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  // 期限。予定のときは、その日の終わり (その日のうちにチェックすれば報酬がもらえる)
  deadline: Date | null;
  repeatId?: string; // 繰り返しでまとめて作ったタスクに共通の ID (繰り返しでなければなし)
  event?: TodoEvent; // 予定のときだけ、何時から何時までか
};
