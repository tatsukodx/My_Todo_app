// 優先度は 1 が低い、2 が中くらい、3 が高い
export const priorityLabels: Record<number, string> = {
  1: "低",
  2: "中",
  3: "高",
};

// 優先度が高いほど星を多くする (1 → ★、3 → ★★★)
export const priorityStars = (priority: number): string => "★".repeat(priority);

// 以前は 1 が高く 3 が低かったので、保存済みのデータの優先度を一度だけ入れ替える
// (React の画面を作る前に 1 回だけ呼ぶ)
const migratedKey = "MyTodoAppPriorityReversed";
const storageKeys = ["MyTodoApp", "MyTodoAppRepeats", "MyTodoAppLog"];

export const reverseSavedPriorities = () => {
  if (localStorage.getItem(migratedKey) !== null) {
    return;
  }
  for (const key of storageKeys) {
    const jsonStr = localStorage.getItem(key);
    if (jsonStr === null) {
      continue;
    }
    const items: { priority: number }[] = JSON.parse(jsonStr);
    const reversed = items.map((item) => ({
      ...item,
      priority: 4 - item.priority,
    }));
    localStorage.setItem(key, JSON.stringify(reversed));
  }
  localStorage.setItem(migratedKey, "done");
};
