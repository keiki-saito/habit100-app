import { getDatabase } from "../lib/db/client";

console.log("Initializing database...");

const _db = getDatabase();

console.log("✅ Database initialized successfully");
console.log("Database file: ./data/habits.db");
