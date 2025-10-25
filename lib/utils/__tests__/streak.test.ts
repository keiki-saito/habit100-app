/**
 * Streak Calculation Tests
 */

import { describe, expect, it } from "vitest";
import type { DailyRecord } from "../../types/habit";
import { calculateStreak } from "../streak";

describe("calculateStreak", () => {
  const createRecord = (dayOffset: number, achieved: boolean): DailyRecord => {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    return {
      id: `record-${dayOffset}`,
      habitId: "habit-1",
      date,
      achieved,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  it("空の記録配列の場合、ストリークは0", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("達成記録がない場合、ストリークは0", () => {
    const records = [
      createRecord(2, false),
      createRecord(1, false),
      createRecord(0, false),
    ];
    expect(calculateStreak(records)).toBe(0);
  });

  it("今日のみ達成の場合、ストリークは1", () => {
    const records = [createRecord(0, true)];
    expect(calculateStreak(records)).toBe(1);
  });

  it("3日連続達成の場合、ストリークは3", () => {
    const records = [
      createRecord(2, true),
      createRecord(1, true),
      createRecord(0, true),
    ];
    expect(calculateStreak(records)).toBe(3);
  });

  it("途中で途切れた場合、最新のストリークのみカウント", () => {
    const records = [
      createRecord(4, true),
      createRecord(3, true),
      createRecord(2, false), // 途切れ
      createRecord(1, true),
      createRecord(0, true),
    ];
    expect(calculateStreak(records)).toBe(2);
  });

  it("過去の達成のみで今日が未達成の場合、ストリークは0", () => {
    const records = [
      createRecord(3, true),
      createRecord(2, true),
      createRecord(1, true),
      createRecord(0, false),
    ];
    expect(calculateStreak(records)).toBe(0);
  });
});
