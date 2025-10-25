/**
 * Date Utility Functions
 * 日付関連のユーティリティ関数
 */

/**
 * 2つの日付が同じ日かどうか判定
 * @param date1 日付1
 * @param date2 日付2
 * @returns 同じ日の場合true
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 開始日からの経過日数を計算
 * @param startDate 開始日
 * @returns 経過日数（開始日を含む、今日が開始日の場合は1を返す）
 */
export function getDaysSince(startDate: Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 開始日を含むため+1
  return diffDays + 1;
}

/**
 * 今日の日付かどうか判定
 * @param date 判定する日付
 * @returns 今日の場合true
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

/**
 * 日付をYYYY-MM-DD形式の文字列に変換
 * @param date 日付
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD形式の文字列を日付に変換
 * @param dateString YYYY-MM-DD形式の文字列
 * @returns 日付オブジェクト
 */
export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  // 時刻を0にセット
  date.setHours(0, 0, 0, 0);
  return date;
}
