/**
 * DayDetailModal Component
 * 日付詳細モーダル
 */

"use client";

import type { DailyRecord } from "@/lib/types/habit";
import { formatDate } from "@/lib/utils/date";

export interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayIndex: number;
  date: Date;
  record?: DailyRecord;
}

export function DayDetailModal({
  isOpen,
  onClose,
  dayIndex,
  date,
  record,
}: DayDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        role="document"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {dayIndex + 1}日目
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>閉じる</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 日付 */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(date)} (
            {date.toLocaleDateString("ja-JP", { weekday: "short" })})
          </p>
        </div>

        {/* 記録内容 */}
        {record ? (
          <div className="space-y-4">
            {/* 達成状況 */}
            <div>
              <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                達成状況
              </div>
              <div
                className={`px-4 py-3 rounded-lg ${
                  record.achieved
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                }`}
              >
                <span className="font-semibold">
                  {record.achieved ? "✅ 達成" : "❌ 未達成"}
                </span>
              </div>
            </div>

            {/* メモ */}
            {record.note && (
              <div>
                <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  メモ
                </div>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {record.note}
                  </p>
                </div>
              </div>
            )}

            {/* 記録日時 */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              記録日時:{" "}
              {record.createdAt.toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              この日の記録はまだありません
            </p>
          </div>
        )}

        {/* 閉じるボタン */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                     text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
