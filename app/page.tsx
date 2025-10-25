"use client";

import Link from "next/link";
import { HabitForm } from "@/components/habit-form";
import { ProgressSummary } from "@/components/progress-summary";
import { RecordButton } from "@/components/record-button";
import { useHabit } from "@/lib/hooks/use-habit";

export default function Home() {
  const {
    habit,
    dailyRecords,
    createHabit,
    recordDay,
    streak,
    achievementRate,
    isLoading,
    error,
  } = useHabit();

  const handleRecord = async (achieved: boolean) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await recordDay({
      date: today,
      achieved,
    });
  };

  if (isLoading && !habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              habit100
            </h1>
            {habit && (
              <nav className="flex gap-4">
                <Link
                  href="/calendar"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  📅 カレンダー
                </Link>
                <Link
                  href="/chat"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  💬 AIコーチ
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg"
            role="alert"
          >
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {!habit ? (
          /* 習慣未登録 - 登録フォーム表示 */
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  100日チャレンジ
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  習慣を登録して、100日間の継続を目指しましょう！
                </p>
              </div>
              <HabitForm onSubmit={createHabit} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          /* 習慣登録済み - ダッシュボード表示 */
          <div className="space-y-8">
            {/* 進捗サマリー */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <ProgressSummary
                habit={habit}
                streak={streak}
                achievementRate={achievementRate}
              />
            </div>

            {/* 今日の記録 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <RecordButton
                dailyRecords={dailyRecords}
                onRecord={handleRecord}
                isLoading={isLoading}
              />
            </div>

            {/* クイックリンク */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/calendar"
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
              >
                <span className="text-4xl mb-2 block">📅</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  カレンダー
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  100日間の進捗を確認
                </p>
              </Link>

              <Link
                href="/chat"
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
              >
                <span className="text-4xl mb-2 block">💬</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AIコーチ
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  パーソナライズされたアドバイス
                </p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
