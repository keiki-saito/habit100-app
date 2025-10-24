export interface HabitRecord {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertRecordData {
  habitId: number;
  date: string;
  completed: boolean;
}
