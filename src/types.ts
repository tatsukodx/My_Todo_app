export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null;
  repeatId?: string; // 繰り返しでまとめて作ったタスクに共通の ID (繰り返しでなければなし)
};
