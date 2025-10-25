/**
 * Habit Domain Types
 * 習慣トラッキングアプリのドメインモデル型定義
 */

/**
 * Habit - 習慣エンティティ
 */
export interface Habit {
  id: string; // UUID
  name: string; // 習慣名（例: "毎日筋トレ"）
  startDate: Date; // 開始日
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

/**
 * DailyRecord - 日次記録エンティティ
 */
export interface DailyRecord {
  id: string; // UUID
  habitId: string; // 習慣ID（外部キー）
  date: Date; // 記録日（YYYY-MM-DD）
  achieved: boolean; // 達成フラグ
  note?: string; // メモ（オプション）
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

/**
 * ChatMessage - チャット履歴（Value Object）
 */
export interface ChatMessage {
  id: string; // UUID
  role: "user" | "assistant" | "system";
  content: string; // メッセージ内容
  timestamp: Date; // 送信日時
}

/**
 * CreateHabitInput - 習慣作成の入力型
 */
export interface CreateHabitInput {
  name: string; // 習慣名（1-100文字）
  startDate: Date; // 開始日（過去または今日）
}

/**
 * UpdateHabitInput - 習慣更新の入力型
 */
export interface UpdateHabitInput {
  id: string; // 習慣ID
  name?: string; // 習慣名（オプション）
}

/**
 * RecordDayInput - 日次記録の入力型
 */
export interface RecordDayInput {
  date: Date; // 記録日
  achieved: boolean; // 達成フラグ
  note?: string; // メモ（オプション、最大500文字）
}
