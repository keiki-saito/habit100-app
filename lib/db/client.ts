import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  CREATE_HABIT_RECORDS_TABLE,
  CREATE_HABITS_TABLE,
  CREATE_INDEXES,
} from "./schema";

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dataDir = path.join(process.cwd(), "data");

    // dataディレクトリが存在しない場合は作成
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, "habits.db");
    db = new Database(dbPath);

    // WALモード有効化（パフォーマンス向上）
    db.pragma("journal_mode = WAL");

    // テーブル作成
    db.exec(CREATE_HABITS_TABLE);
    db.exec(CREATE_HABIT_RECORDS_TABLE);

    // インデックス作成
    for (const sql of CREATE_INDEXES) {
      db.exec(sql);
    }
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
