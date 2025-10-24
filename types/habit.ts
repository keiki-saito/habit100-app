export interface Habit {
  id: number;
  name: string;
  color: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitData {
  name: string;
  color: string;
  startDate: string;
}

export interface UpdateHabitData {
  name?: string;
  color?: string;
  startDate?: string;
}
