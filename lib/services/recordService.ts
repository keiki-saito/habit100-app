import type { HabitRecord, UpsertRecordData } from "@/types/record";
import { getDatabase } from "../db/client";
import { DateUtils } from "../utils/dateUtils";

interface RecordRow {
  id: number;
  habit_id: number;
  date: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

function mapRowToRecord(row: RecordRow): HabitRecord {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getRecordsByHabit(
  habitId: number,
  startDate: string,
  endDate: string,
): HabitRecord[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM habit_records
    WHERE habit_id = ? AND date >= ? AND date <= ?
    ORDER BY date ASC
  `);
  const rows = stmt.all(habitId, startDate, endDate) as RecordRow[];
  return rows.map(mapRowToRecord);
}

export function upsertRecord(data: UpsertRecordData): HabitRecord {
  const db = getDatabase();
  const now = DateUtils.formatDateTime(new Date());
  const completed = data.completed ? 1 : 0;

  const stmt = db.prepare(`
    INSERT INTO habit_records (habit_id, date, completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(habit_id, date)
    DO UPDATE SET completed = ?, updated_at = ?
  `);

  stmt.run(data.habitId, data.date, completed, now, now, completed, now);

  const selectStmt = db.prepare(
    "SELECT * FROM habit_records WHERE habit_id = ? AND date = ?",
  );
  return mapRowToRecord(selectStmt.get(data.habitId, data.date) as RecordRow);
}

export function deleteRecordsByHabit(habitId: number): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM habit_records WHERE habit_id = ?");
  stmt.run(habitId);
}

// 下位互換性のために古いクラス形式のエクスポートも保持
export const RecordService = {
  getRecordsByHabit,
  upsertRecord,
  deleteRecordsByHabit,
};
