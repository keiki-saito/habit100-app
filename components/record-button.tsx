/**
 * RecordButton Component
 * 今日の記録ボタン
 */

"use client";

import { useState } from "react";
import type { DailyRecord } from "@/lib/types/habit";
import { isToday } from "@/lib/utils/date";

export interface RecordButtonProps {
  dailyRecords: DailyRecord[];
  onRecord: (achieved: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function RecordButton({
  dailyRecords,
  onRecord,
  isLoading = false,
}: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);

  // 今日の記録を取得
  const todayRecord = dailyRecords.find((r) => isToday(r.date));

  const handleRecord = async (achieved: boolean) => {
    // 既に記録がある場合は確認ダイアログを表示
    if (todayRecord) {
      const confirmed = window.confirm(
        `今日の記録を${achieved ? "達成" : "未達成"}に変更しますか？`,
      );
      if (!confirmed) {
        return;
      }
    }

    setIsRecording(true);
    try {
      await onRecord(achieved);
    } finally {
      setIsRecording(false);
    }
  };

  const isDisabled = isLoading || isRecording;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        今日の記録
      </h3>

      {todayRecord && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            今日は
            <span className="font-semibold mx-1">
              {todayRecord.achieved ? "達成" : "未達成"}
            </span>
            として記録されています
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleRecord(true)}
          disabled={isDisabled}
          className="px-6 py-4 text-white bg-green-600 hover:bg-green-700
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   rounded-lg font-medium transition-all transform hover:scale-105
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                   active:scale-95"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">✅</span>
            <span>達成</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleRecord(false)}
          disabled={isDisabled}
          className="px-6 py-4 text-white bg-red-600 hover:bg-red-700
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   rounded-lg font-medium transition-all transform hover:scale-105
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                   active:scale-95"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">❌</span>
            <span>未達成</span>
          </div>
        </button>
      </div>

      {isRecording && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          記録中...
        </p>
      )}
    </div>
  );
}
