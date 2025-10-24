import type { CreateHabitData, Habit, UpdateHabitData } from "@/types/habit";
import { getDatabase } from "../db/client";
import { DateUtils } from "../utils/dateUtils";

interface HabitRow {
  id: number;
  name: string;
  color: string;
  start_date: string;
  created_at: string;
  updated_at: string;
}

function mapRowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    startDate: row.start_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllHabits(): Habit[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM habits ORDER BY created_at DESC");
  const rows = stmt.all() as HabitRow[];
  return rows.map(mapRowToHabit);
}

export function getHabitById(id: number): Habit | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM habits WHERE id = ?");
  const row = stmt.get(id) as HabitRow | undefined;
  return row ? mapRowToHabit(row) : null;
}

export function createHabit(data: CreateHabitData): Habit {
  const db = getDatabase();
  const now = DateUtils.formatDateTime(new Date());
  const stmt = db.prepare(`
    INSERT INTO habits (name, color, start_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(data.name, data.color, data.startDate, now, now);
  const habit = getHabitById(result.lastInsertRowid as number);
  if (!habit) {
    throw new Error("Failed to create habit");
  }
  return habit;
}

export function updateHabit(id: number, data: UpdateHabitData): Habit {
  const db = getDatabase();
  const now = DateUtils.formatDateTime(new Date());
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.color !== undefined) {
    updates.push("color = ?");
    values.push(data.color);
  }
  if (data.startDate !== undefined) {
    updates.push("start_date = ?");
    values.push(data.startDate);
  }

  updates.push("updated_at = ?");
  values.push(now, id);

  const stmt = db.prepare(
    `UPDATE habits SET ${updates.join(", ")} WHERE id = ?`,
  );
  stmt.run(...values);
  const habit = getHabitById(id);
  if (!habit) {
    throw new Error("Failed to update habit");
  }
  return habit;
}

export function deleteHabit(id: number): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM habits WHERE id = ?");
  stmt.run(id);
}

// 下位互換性のために古いクラス形式のエクスポートも保持
export const HabitService = {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
};
