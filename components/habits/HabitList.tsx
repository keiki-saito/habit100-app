"use client";

import type { Habit } from "@/types/habit";
import type { HabitStats } from "@/types/stats";
import { HabitCard } from "./HabitCard";

interface HabitListProps {
  habits: Array<{ habit: Habit; stats: HabitStats }>;
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">まだ習慣が登録されていません</p>
        <p className="mt-2 text-sm text-gray-400">
          「新しい習慣」ボタンから習慣を追加しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {habits.map(({ habit, stats }) => (
        <HabitCard key={habit.id} habit={habit} stats={stats} />
      ))}
    </div>
  );
}
