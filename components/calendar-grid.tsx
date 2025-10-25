/**
 * CalendarGrid Component
 * 100日間の進捗を10×10グリッドで表示
 */

"use client";

import type { DailyRecord, Habit } from "@/lib/types/habit";
import { getDaysSince, isSameDay, isToday } from "@/lib/utils/date";

export interface CalendarGridProps {
  habit: Habit;
  dailyRecords: DailyRecord[];
  onCellClick?: (dayIndex: number, date: Date) => void;
}

export function CalendarGrid({
  habit,
  dailyRecords,
  onCellClick,
}: CalendarGridProps) {
  // 100日分のセルデータを生成
  const cells = Array.from({ length: 100 }, (_, index) => {
    const dayIndex = index;
    const cellDate = new Date(habit.startDate);
    cellDate.setDate(cellDate.getDate() + dayIndex);

    // その日の記録を取得
    const record = dailyRecords.find((r) => isSameDay(r.date, cellDate));

    // セルの状態を判定
    const daysSinceStart = getDaysSince(habit.startDate);
    const isReached = dayIndex < daysSinceStart; // 到達済みの日付
    const isTodayCell = isToday(cellDate);
    const isAchieved = record?.achieved ?? false;
    const isFailed = isReached && !record?.achieved;

    return {
      dayIndex,
      date: cellDate,
      record,
      isReached,
      isToday: isTodayCell,
      isAchieved,
      isFailed,
    };
  });

  const getCellColor = (cell: (typeof cells)[0]) => {
    if (cell.isAchieved) {
      return "bg-green-500 hover:bg-green-600"; // 達成
    }
    if (cell.isFailed) {
      return "bg-red-400 hover:bg-red-500"; // 未達成
    }
    if (!cell.isReached) {
      return "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"; // 未到達
    }
    return "bg-yellow-300 hover:bg-yellow-400"; // 到達済みだが未記録
  };

  const getCellBorder = (cell: (typeof cells)[0]) => {
    if (cell.isToday) {
      return "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900";
    }
    return "";
  };

  return (
    <div className="w-full">
      {/* カレンダーグリッド */}
      <div className="grid grid-cols-10 gap-2 sm:gap-3">
        {cells.map((cell) => (
          <button
            key={cell.dayIndex}
            type="button"
            onClick={() =>
              cell.isReached && onCellClick?.(cell.dayIndex, cell.date)
            }
            disabled={!cell.isReached}
            className={`
              aspect-square rounded-lg transition-all transform
              ${getCellColor(cell)}
              ${getCellBorder(cell)}
              ${cell.isReached ? "hover:scale-110 cursor-pointer" : ""}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            title={`${cell.dayIndex + 1}日目 (${cell.date.toLocaleDateString("ja-JP")})`}
            aria-label={`${cell.dayIndex + 1}日目 ${
              cell.isAchieved
                ? "達成"
                : cell.isFailed
                  ? "未達成"
                  : cell.isToday
                    ? "今日"
                    : "未到達"
            }`}
          >
            <span className="text-xs font-semibold text-white dark:text-gray-900">
              {cell.dayIndex + 1}
            </span>
          </button>
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-700 dark:text-gray-300">達成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">未達成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300 rounded" />
          <span className="text-gray-700 dark:text-gray-300">未記録</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="text-gray-700 dark:text-gray-300">未到達</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded ring-2 ring-blue-500 ring-offset-2" />
          <span className="text-gray-700 dark:text-gray-300">今日</span>
        </div>
      </div>
    </div>
  );
}
