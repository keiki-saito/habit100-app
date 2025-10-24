"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { Calendar100Days } from "@/components/calendar/Calendar100Days";
import { HabitForm } from "@/components/habits/HabitForm";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { Button } from "@/components/ui/Button";
import { CompletionCelebration } from "@/components/ui/CompletionCelebration";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatsCalculator } from "@/lib/utils/statsCalculator";
import type { Habit } from "@/types/habit";
import type { HabitRecord } from "@/types/record";
import type { HabitStats } from "@/types/stats";

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const habitId = Number.parseInt(resolvedParams.id, 10);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchHabitData = useCallback(async () => {
    try {
      // 習慣取得
      const habitRes = await fetch("/api/habits");
      const { habits } = await habitRes.json();
      const foundHabit = habits.find((h: Habit) => h.id === habitId);

      if (!foundHabit) {
        router.push("/");
        return;
      }

      setHabit(foundHabit);

      // 記録取得
      const recordsRes = await fetch(
        `/api/records?habitId=${habitId}&startDate=${foundHabit.startDate}`,
      );
      const { records: fetchedRecords } = await recordsRes.json();
      setRecords(fetchedRecords);

      // 統計計算
      const calculatedStats = StatsCalculator.calculateStats(
        fetchedRecords,
        foundHabit.startDate,
      );
      setStats(calculatedStats);

      // 100日達成時にお祝いを表示
      if (calculatedStats.completedDays === 100 && !showCelebration) {
        setShowCelebration(true);
      }
    } catch (error) {
      console.error("Failed to fetch habit data:", error);
    }
  }, [habitId, router, showCelebration]);

  useEffect(() => {
    fetchHabitData();
  }, [fetchHabitData]);

  const handleToggleDay = async (date: string) => {
    if (!habit) return;

    const existingRecord = records.find((r) => r.date === date);
    const newCompleted = existingRecord ? !existingRecord.completed : true;

    try {
      await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: habit.id,
          date,
          completed: newCompleted,
        }),
      });

      await fetchHabitData();
    } catch (error) {
      console.error("Failed to toggle record:", error);
    }
  };

  const handleUpdateHabit = async (data: {
    name: string;
    color: string;
    startDate: string;
  }) => {
    try {
      await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchHabitData();
    } catch (error) {
      console.error("Failed to update habit:", error);
    }
  };

  const handleDeleteHabit = async () => {
    try {
      await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
      router.push("/");
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  if (!habit || !stats) {
    return <div className="p-8">読み込み中...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* 100日達成アニメーション */}
      {showCelebration && (
        <CompletionCelebration
          isComplete={showCelebration}
          habitName={habit.name}
          habitColor={habit.color}
          onClose={() => setShowCelebration(false)}
        />
      )}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 戻る
          </button>
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <h1 className="text-3xl font-bold">{habit.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEditFormOpen(true)}>
            編集
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
            削除
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Calendar100Days
            habitId={habit.id}
            habitColor={habit.color}
            startDate={habit.startDate}
            records={records}
            onToggle={handleToggleDay}
          />
        </div>
        <div>
          <StatsPanel stats={stats} color={habit.color} />
        </div>
      </div>

      <HabitForm
        habit={habit}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleUpdateHabit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteHabit}
        title="習慣を削除"
        message="この習慣と全ての記録を削除してもよろしいですか?この操作は取り消せません。"
      />
    </div>
  );
}
