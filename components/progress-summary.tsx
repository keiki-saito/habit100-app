/**
 * ProgressSummary Component
 * 進捗サマリー表示
 */

"use client";

import type { Habit } from "@/lib/types/habit";
import { formatDate } from "@/lib/utils/date";

export interface ProgressSummaryProps {
  habit: Habit;
  streak: number;
  achievementRate: number;
}

export function ProgressSummary({
  habit,
  streak,
  achievementRate,
}: ProgressSummaryProps) {
  return (
    <div className="space-y-4">
      {/* 習慣名 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {habit.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          開始日: {formatDate(habit.startDate)}
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 gap-4">
        {/* ストリーク */}
        <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🔥</span>
            <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
              ストリーク
            </p>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {streak}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              日連続
            </p>
          </div>
        </div>

        {/* 達成率 */}
        <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">📊</span>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              達成率
            </p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {achievementRate}%
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">全期間</p>
          </div>
        </div>
      </div>

      {/* マイルストーン表示（オプション） */}
      {streak >= 7 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-center text-yellow-800 dark:text-yellow-200">
            {streak >= 100
              ? "🎉 100日達成！素晴らしい！"
              : streak >= 50
                ? "🌟 50日達成！あと半分！"
                : streak >= 30
                  ? "💪 30日達成！継続は力なり！"
                  : "🎊 7日達成！良いスタート！"}
          </p>
        </div>
      )}
    </div>
  );
}
