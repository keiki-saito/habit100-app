import type { HabitRecord } from "@/types/record";
import type { HabitStats } from "@/types/stats";
import { addDays } from "./dateUtils";

/**
 * 習慣の統計情報を計算
 */
export function calculateStats(
  records: HabitRecord[],
  startDate: string,
): HabitStats {
  const completedRecords = records.filter((r) => r.completed);
  const completedDays = completedRecords.length;

  return {
    completedDays,
    totalDays: 100,
    completionRate: calculateCompletionRate(records),
    currentStreak: calculateCurrentStreak(records, startDate),
    longestStreak: calculateLongestStreak(records),
  };
}

/**
 * 達成率を計算 (100日中の達成日数の割合)
 */
function calculateCompletionRate(records: HabitRecord[]): number {
  const completedCount = records.filter((r) => r.completed).length;
  // 100日中の達成日数なので、達成日数がそのままパーセンテージになる
  return completedCount;
}

/**
 * 現在の連続達成日数を計算 (最新の達成日から遡って連続で達成している日数)
 */
function calculateCurrentStreak(
  records: HabitRecord[],
  startDate: string,
): number {
  // 達成済みの記録のみを取得して降順にソート
  const completedRecords = records
    .filter((r) => r.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (completedRecords.length === 0) return 0;

  // 開始日
  const start = new Date(startDate);

  let streak = 0;
  let expectedDate = completedRecords[0].date; // 最新の達成日から開始

  for (const record of completedRecords) {
    // 開始日より前の記録は無視
    if (new Date(record.date) < start) break;

    // 期待される日付と一致する場合のみカウント
    if (record.date === expectedDate) {
      streak++;
      expectedDate = addDays(expectedDate, -1);
    } else {
      // 日付が飛んでいる = 連続達成が途切れた
      break;
    }
  }

  return streak;
}

/**
 * 最長連続達成日数を計算
 */
function calculateLongestStreak(records: HabitRecord[]): number {
  if (records.length === 0) return 0;

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: string | null = null;

  for (const record of sortedRecords) {
    if (record.completed) {
      if (lastDate === null) {
        // 最初の達成日
        currentStreak = 1;
      } else {
        const expectedDate = addDays(lastDate, 1);
        if (record.date === expectedDate) {
          // 連続達成
          currentStreak++;
        } else {
          // 連続途切れ
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      lastDate = record.date;
    } else {
      // 未達成の場合は連続をリセット
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
      lastDate = null;
    }
  }

  return Math.max(maxStreak, currentStreak);
}

// 下位互換性のために古いクラス形式のエクスポートも保持
export const StatsCalculator = {
  calculateStats,
};
