import dayjs from "dayjs";

// 時刻を指定しなかった期限は「その日中」= その日の 23:59:59.999 にする
export const endOfDay = (date: string | Date): Date =>
  dayjs(date).endOf("day").toDate();

// 「その日中」の期限か (時刻を指定しなかった期限か)
export const isAllDay = (date: Date): boolean =>
  date.getHours() === 23 &&
  date.getMinutes() === 59 &&
  date.getSeconds() === 59;

// 期限の表示。その日中の期限は日付だけにする
// (0:00 ちょうどの期限も、前から日付だけで表示している)
export const formatDeadline = (date: Date, format = "YYYY/MM/DD"): string => {
  if (isAllDay(date)) {
    return `${dayjs(date).format(format)} 中`;
  }
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    return dayjs(date).format(format);
  }
  return dayjs(date).format(`${format} HH:mm`);
};
