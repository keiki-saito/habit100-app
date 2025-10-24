"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/stats/ProgressBar";
import type { Habit } from "@/types/habit";

interface HabitCardProps {
  habit: Habit;
  stats: {
    completedDays: number;
    completionRate: number;
    currentStreak: number;
  };
}

export function HabitCard({ habit, stats }: HabitCardProps) {
  return (
    <Link href={`/habits/${habit.id}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="text-lg font-semibold">{habit.name}</h3>
        </div>

        <ProgressBar
          current={stats.completedDays}
          total={100}
          color={habit.color}
        />

        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>{stats.completedDays} / 100日</span>
          <span>連続: {stats.currentStreak}日</span>
        </div>
      </div>
    </Link>
  );
}
