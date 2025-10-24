import type { HabitStats } from "@/types/stats";

interface StatsPanelProps {
  stats: HabitStats;
  color: string;
}

export function StatsPanel({ stats, color }: StatsPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">統計情報</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">達成日数</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {stats.completedDays} / {stats.totalDays}日
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">達成率</p>
          <p className="text-2xl font-bold">
            {stats.completionRate.toFixed(1)}%
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">現在の連続</p>
            <p className="text-xl font-semibold">{stats.currentStreak}日</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">最長連続</p>
            <p className="text-xl font-semibold">{stats.longestStreak}日</p>
          </div>
        </div>
      </div>
    </div>
  );
}
