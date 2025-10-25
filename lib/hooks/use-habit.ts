/**
 * useHabit Hook
 * 習慣データ管理のカスタムフック
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type IHabitRepository,
  LocalStorageHabitRepository,
} from "../repositories/habit-repository";
import { LocalStorageAdapter } from "../storage/local-storage-adapter";
import type {
  CreateHabitInput,
  DailyRecord,
  Habit,
  RecordDayInput,
} from "../types/habit";
import { calculateAchievementRate } from "../utils/achievement-rate";
import { calculateStreak } from "../utils/streak";

/**
 * useHabit戻り値の型
 */
export interface UseHabitReturn {
  habit: Habit | null;
  dailyRecords: DailyRecord[];
  createHabit: (data: CreateHabitInput) => Promise<void>;
  updateHabitName: (name: string) => Promise<void>;
  recordDay: (data: RecordDayInput) => Promise<void>;
  deleteHabit: () => Promise<void>;
  streak: number;
  achievementRate: number;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}

/**
 * useHabit - 習慣データ管理フック
 * @returns 習慣データと操作関数
 */
export function useHabit(): UseHabitReturn {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Repositoryのシングルトンインスタンス
  const [repository] = useState<IHabitRepository>(() => {
    const storage = new LocalStorageAdapter();
    return new LocalStorageHabitRepository(storage);
  });

  // 初期データロード
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        const habitData = repository.getHabit();
        const recordsData = repository.getDailyRecords();

        setHabit(habitData);
        setDailyRecords(recordsData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("データの読み込みに失敗しました"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [repository]);

  // 習慣を作成
  const createHabit = useCallback(
    async (data: CreateHabitInput) => {
      try {
        setIsLoading(true);
        const newHabit = repository.createHabit(data);
        setHabit(newHabit);
        setError(null);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("習慣の作成に失敗しました");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  // 習慣名を更新
  const updateHabitName = useCallback(
    async (name: string) => {
      if (!habit) {
        throw new Error("習慣が登録されていません");
      }

      try {
        setIsLoading(true);
        const updatedHabit = repository.updateHabit({
          id: habit.id,
          name,
        });
        setHabit(updatedHabit);
        setError(null);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("習慣の更新に失敗しました");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [habit, repository],
  );

  // 日次記録を保存
  const recordDay = useCallback(
    async (data: RecordDayInput) => {
      try {
        setIsLoading(true);
        const record = repository.recordDay(data);

        // 記録を更新（既存の記録を置き換えるか追加）
        setDailyRecords((prev) => {
          const existingIndex = prev.findIndex((r) => r.id === record.id);
          if (existingIndex !== -1) {
            // 更新
            const updated = [...prev];
            updated[existingIndex] = record;
            return updated;
          }
          // 新規追加
          return [...prev, record].sort(
            (a, b) => a.date.getTime() - b.date.getTime(),
          );
        });

        setError(null);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("記録の保存に失敗しました");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  // 習慣を削除
  const deleteHabit = useCallback(async () => {
    try {
      setIsLoading(true);
      repository.clear();
      setHabit(null);
      setDailyRecords([]);
      setError(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("習慣の削除に失敗しました");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ストリークを計算
  const streak = calculateStreak(dailyRecords);

  // 達成率を計算
  const achievementRate = habit
    ? calculateAchievementRate(dailyRecords, habit.startDate)
    : 0;

  return {
    habit,
    dailyRecords,
    createHabit,
    updateHabitName,
    recordDay,
    deleteHabit,
    streak,
    achievementRate,
    isLoading,
    error,
    clearError,
  };
}
