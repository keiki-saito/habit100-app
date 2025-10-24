/**
 * Date を YYYY-MM-DD 形式の文字列に変換
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Date を ISO 8601 完全形式の文字列に変換
 */
export function formatDateTime(date: Date): string {
  return date.toISOString();
}

/**
 * 開始日から100日分の日付配列を生成
 */
export function generate100Days(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < 100; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    dates.push(formatDate(current));
  }

  return dates;
}

/**
 * 2つの日付文字列が同じ日かどうかを判定
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * 指定した日付が今日かどうかを判定
 */
export function isToday(date: string): boolean {
  const today = formatDate(new Date());
  return isSameDay(date, today);
}

/**
 * 指定した日付にN日加算
 */
export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// 下位互換性のために古いクラス形式のエクスポートも保持
export const DateUtils = {
  formatDate,
  formatDateTime,
  generate100Days,
  isSameDay,
  isToday,
  addDays,
};
