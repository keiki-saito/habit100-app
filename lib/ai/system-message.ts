/**
 * System Message Builder
 * AIコーチング用のシステムメッセージ生成
 */

import type { DailyRecord, Habit } from "../types/habit";
import { calculateAchievementRate } from "../utils/achievement-rate";
import { formatDate } from "../utils/date";
import { calculateStreak } from "../utils/streak";

/**
 * AIコーチング用のシステムメッセージを生成
 * @param habit 習慣データ
 * @param dailyRecords 日次記録
 * @returns システムメッセージ
 */
export function buildSystemMessage(
  habit: Habit | null,
  dailyRecords: DailyRecord[],
): string {
  // 習慣が未登録の場合
  if (!habit) {
    return `あなたは習慣形成をサポートするAIコーチです。
ユーザーの習慣継続を励まし、パーソナライズされたアドバイスを提供してください。

現在、ユーザーは習慣をまだ登録していません。
習慣を登録して100日間のチャレンジを始めることを勧めてください。`;
  }

  // 進捗データを計算
  const streak = calculateStreak(dailyRecords);
  const achievementRate = calculateAchievementRate(
    dailyRecords,
    habit.startDate,
  );

  // 最近7日間の記録を取得
  const recentRecords = dailyRecords
    .slice(-7)
    .map((r) => (r.achieved ? "✓" : "✗"))
    .join(" ");

  // マイルストーン判定
  const milestones = [7, 30, 50, 100];
  const reachedMilestone = milestones.find((m) => streak === m);

  // 挫折リスク判定（3日連続未達成）
  const last3Records = dailyRecords.slice(-3);
  const isAtRisk =
    last3Records.length === 3 && last3Records.every((r) => !r.achieved);

  // システムメッセージを構築
  let message = `あなたは習慣形成をサポートするAIコーチです。

## 現在のユーザー情報
- **習慣名**: ${habit.name}
- **開始日**: ${formatDate(habit.startDate)}
- **現在のストリーク**: ${streak}日連続達成
- **全体の達成率**: ${achievementRate}%
- **最近7日間の記録**: ${recentRecords || "（記録なし）"}

## あなたの役割
ユーザーの進捗に基づいて、パーソナライズされたアドバイス、励まし、挫折予防のサポートを提供してください。

## 重要な指示`;

  // マイルストーン到達時
  if (reachedMilestone) {
    message += `\n- 🎉 **マイルストーン到達！** ユーザーは${reachedMilestone}日を達成しました。心から祝福し、次の目標への意欲を高めてください。`;
  }

  // 挫折リスク時
  if (isAtRisk) {
    message += `\n- ⚠️ **挫折リスク検出** 3日連続で未達成です。優しく励まし、再開のための具体的なアドバイスを提供してください。`;
  }

  // 高達成率時
  if (achievementRate >= 80) {
    message += `\n- ✨ 達成率が${achievementRate}%と非常に高いです。この調子を維持できるようサポートしてください。`;
  }

  // 低達成率時
  if (achievementRate < 50 && dailyRecords.length >= 7) {
    message += `\n- 💪 達成率が${achievementRate}%です。ユーザーが諦めないよう、ポジティブな視点でサポートしてください。`;
  }

  message += `\n\n応答は日本語で、親しみやすく、前向きなトーンで行ってください。`;

  return message;
}
