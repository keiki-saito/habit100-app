"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarGrid } from "@/components/calendar-grid";
import { DayDetailModal } from "@/components/day-detail-modal";
import { useHabit } from "@/lib/hooks/use-habit";
import type { DailyRecord } from "@/lib/types/habit";

export default function CalendarPage() {
  const { habit, dailyRecords, streak, achievementRate, isLoading } =
    useHabit();
  const [selectedDay, setSelectedDay] = useState<{
    dayIndex: number;
    date: Date;
    record?: DailyRecord;
  } | null>(null);

  const handleCellClick = (dayIndex: number, date: Date) => {
    const record = dailyRecords.find((r) => {
      const recordDate = new Date(r.date);
      recordDate.setHours(0, 0, 0, 0);
      const cellDate = new Date(date);
      cellDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === cellDate.getTime();
    });

    setSelectedDay({ dayIndex, date, record });
  };

  const handleCloseModal = () => {
    setSelectedDay(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            習慣が登録されていません
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            まず習慣を登録してください
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← ホーム
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              100日カレンダー
            </h1>
            <Link
              href="/chat"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              💬 AIコーチ
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 習慣名と統計 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {habit.name}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* ストリーク */}
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-1">
                  ストリーク
                </p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {streak}
                  <span className="text-lg ml-1">日</span>
                </p>
              </div>

              {/* 達成率 */}
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  達成率
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {achievementRate}
                  <span className="text-lg ml-1">%</span>
                </p>
              </div>
            </div>
          </div>

          {/* カレンダーグリッド */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <CalendarGrid
              habit={habit}
              dailyRecords={dailyRecords}
              onCellClick={handleCellClick}
            />
          </div>

          {/* ヒント */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>ヒント:</strong>{" "}
              セルをクリックすると、その日の詳細を確認できます
            </p>
          </div>
        </div>
      </main>

      {/* モーダル */}
      {selectedDay && (
        <DayDetailModal
          isOpen={!!selectedDay}
          onClose={handleCloseModal}
          dayIndex={selectedDay.dayIndex}
          date={selectedDay.date}
          record={selectedDay.record}
        />
      )}
    </div>
  );
}
