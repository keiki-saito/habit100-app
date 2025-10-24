export const CREATE_HABITS_TABLE = `
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    start_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

export const CREATE_HABIT_RECORDS_TABLE = `
  CREATE TABLE IF NOT EXISTS habit_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL CHECK(completed IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
  )
`;

export const CREATE_INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_habit_records_habit_id ON habit_records(habit_id)",
  "CREATE INDEX IF NOT EXISTS idx_habit_records_date ON habit_records(date)",
];
