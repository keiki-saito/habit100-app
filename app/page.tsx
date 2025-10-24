"use client";

import { useCallback, useEffect, useState } from "react";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitList } from "@/components/habits/HabitList";
import { Button } from "@/components/ui/Button";
import { StatsCalculator } from "@/lib/utils/statsCalculator";
import type { Habit } from "@/types/habit";
import type { HabitStats } from "@/types/stats";

export default function HomePage() {
  const [habits, setHabits] = useState<
    Array<{ habit: Habit; stats: HabitStats }>
  >([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      const { habits: fetchedHabits } = await res.json();

      // 各習慣の統計を取得
      const habitsWithStats = await Promise.all(
        fetchedHabits.map(async (habit: Habit) => {
          const statsRes = await fetch(
            `/api/records?habitId=${habit.id}&startDate=${habit.startDate}`,
          );
          const { records } = await statsRes.json();

          // 統計計算
          const stats = StatsCalculator.calculateStats(
            records,
            habit.startDate,
          );

          return { habit, stats };
        }),
      );

      setHabits(habitsWithStats);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleCreateHabit = async (data: {
    name: string;
    color: string;
    startDate: string;
  }) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await fetchHabits();
    }
  };

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">100日チャレンジ</h1>
        <Button onClick={() => setIsFormOpen(true)}>新しい習慣</Button>
      </div>

      <HabitList habits={habits} />

      <HabitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateHabit}
      />
    </div>
  );
}
