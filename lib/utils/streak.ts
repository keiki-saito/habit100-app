/**
 * Streak Calculation Utility
 * ストリーク（連続達成日数）の計算
 */

import type { DailyRecord } from "../types/habit";
import { isSameDay } from "./date";

/**
 * ストリーク（連続達成日数）を計算
 * @param records 日次記録の配列（日付昇順を推奨）
 * @returns 現在の連続達成日数
 *
 * ロジック:
 * - 最新の記録から遡って、連続して達成している日数をカウント
 * - 未達成が見つかった時点で終了
 * - 記録が空の場合は0を返す
 */
export function calculateStreak(records: DailyRecord[]): number {
  if (records.length === 0) {
    return 0;
  }

  // 達成した記録のみをフィルター
  const achievedRecords = records.filter((r) => r.achieved);

  if (achievedRecords.length === 0) {
    return 0;
  }

  // 日付で降順ソート（最新が先頭）
  const sortedRecords = [...achievedRecords].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  let streak = 0;
  const expectedDate = new Date();

  for (const record of sortedRecords) {
    // 日付を正規化（時刻を除去）
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    expectedDate.setHours(0, 0, 0, 0);

    if (isSameDay(recordDate, expectedDate)) {
      streak++;
      // 次の期待日付は1日前
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      // 連続が途切れた場合
      break;
    }
  }

  return streak;
}

/**
 * 最長ストリークを計算（オプション機能）
 * @param records 日次記録の配列
 * @returns 過去の最長連続達成日数
 */
export function calculateLongestStreak(records: DailyRecord[]): number {
  if (records.length === 0) {
    return 0;
  }

  const achievedRecords = records
    .filter((r) => r.achieved)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (achievedRecords.length === 0) {
    return 0;
  }

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < achievedRecords.length; i++) {
    const prevDate = new Date(achievedRecords[i - 1].date);
    const currDate = new Date(achievedRecords[i].date);

    // 時刻を除去
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);

    // 1日後かどうかチェック
    const expectedNextDate = new Date(prevDate);
    expectedNextDate.setDate(expectedNextDate.getDate() + 1);

    if (isSameDay(currDate, expectedNextDate)) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}
