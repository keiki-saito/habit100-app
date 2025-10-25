/**
 * HabitForm Component
 * 習慣登録フォーム
 */

"use client";

import { useState } from "react";
import type { CreateHabitInput } from "@/lib/types/habit";

export interface HabitFormProps {
  onSubmit: (data: CreateHabitInput) => Promise<void>;
  isLoading?: boolean;
}

export function HabitForm({ onSubmit, isLoading = false }: HabitFormProps) {
  const [habitName, setHabitName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!habitName.trim()) {
      setError("習慣名を入力してください");
      return;
    }

    if (habitName.length > 100) {
      setError("習慣名は100文字以内で入力してください");
      return;
    }

    try {
      // 開始日は今日
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      await onSubmit({
        name: habitName,
        startDate,
      });

      // 成功したらフォームをクリア
      setHabitName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "習慣の登録に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="habit-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          習慣名
        </label>
        <input
          id="habit-name"
          type="text"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="例: 毎日筋トレ"
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                   disabled:opacity-50 disabled:cursor-not-allowed
                   dark:bg-gray-800 dark:text-white"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {habitName.length}/100文字
        </p>
      </div>

      {error && (
        <div
          className="p-3 text-sm text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !habitName.trim()}
        className="w-full px-6 py-3 text-white bg-blue-600 hover:bg-blue-700
                 disabled:bg-gray-400 disabled:cursor-not-allowed
                 rounded-lg font-medium transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isLoading ? "登録中..." : "習慣を登録"}
      </button>
    </form>
  );
}
