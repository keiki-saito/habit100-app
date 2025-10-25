/**
 * Achievement Rate Calculation Utility
 * 達成率の計算
 */

import type { DailyRecord } from "../types/habit";
import { getDaysSince } from "./date";

/**
 * 達成率を計算
 * @param records 日次記録の配列
 * @param startDate 習慣の開始日
 * @returns 達成率（0-100のパーセンテージ）
 *
 * ロジック:
 * - 開始日から今日までの経過日数を計算
 * - 達成した記録数を経過日数で割る
 * - 記録が空の場合は0%を返す
 */
export function calculateAchievementRate(
  records: DailyRecord[],
  startDate: Date,
): number {
  const daysSinceStart = getDaysSince(startDate);

  if (daysSinceStart === 0) {
    // 今日が開始日の場合
    const todayRecords = records.filter((r) => {
      const recordDate = new Date(r.date);
      recordDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    if (todayRecords.length > 0 && todayRecords[0].achieved) {
      return 100;
    }
    return 0;
  }

  // 達成した記録数
  const achievedCount = records.filter((r) => r.achieved).length;

  // 達成率を計算（0-100の範囲）
  const rate = (achievedCount / daysSinceStart) * 100;

  // 小数点以下1桁に丸める
  return Math.round(rate * 10) / 10;
}

/**
 * 最近N日間の達成率を計算
 * @param records 日次記録の配列
 * @param days 期間（日数）
 * @returns 最近N日間の達成率（0-100のパーセンテージ）
 */
export function calculateRecentAchievementRate(
  records: DailyRecord[],
  days: number = 7,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - days + 1);

  const recentRecords = records.filter((r) => {
    const recordDate = new Date(r.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate >= cutoffDate;
  });

  if (recentRecords.length === 0) {
    return 0;
  }

  const achievedCount = recentRecords.filter((r) => r.achieved).length;
  const rate = (achievedCount / days) * 100;

  return Math.round(rate * 10) / 10;
}
