"use client";

import { memo } from "react";

interface DayCellProps {
  dayNumber: number;
  date: string;
  completed: boolean | null;
  color: string;
  isToday: boolean;
  isFuture: boolean;
  onClick: () => void;
}

export const DayCell = memo(function DayCell({
  dayNumber,
  date,
  completed,
  color,
  isToday,
  isFuture,
  onClick,
}: DayCellProps) {
  const getCellStyles = () => {
    // 未来日の場合は無効化スタイル
    if (isFuture) {
      return {
        backgroundColor: "#f9fafb",
        borderColor: "#e5e7eb",
        opacity: 0.5,
      };
    }

    if (completed === true) {
      return {
        backgroundColor: color,
        borderColor: color,
      };
    }
    if (completed === false) {
      return {
        backgroundColor: "#f3f4f6",
        borderColor: "#d1d5db",
      };
    }
    return {
      backgroundColor: "white",
      borderColor: "#e5e7eb",
    };
  };

  // 日付をMM/DD形式にフォーマット
  const formatDisplayDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
  };

  const styles = getCellStyles();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isFuture}
      className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
        isToday ? "ring-2 ring-blue-500 ring-offset-2" : ""
      } ${isFuture ? "cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
      style={styles}
    >
      <span
        className={`text-sm font-semibold ${
          isFuture
            ? "text-gray-400"
            : completed === true
              ? "text-white"
              : "text-gray-700"
        }`}
      >
        {formatDisplayDate(date)}
      </span>
      <span
        className={`text-xs ${
          isFuture
            ? "text-gray-300"
            : completed === true
              ? "text-white/90"
              : "text-gray-500"
        }`}
      >
        Day {dayNumber}
      </span>
    </button>
  );
});
