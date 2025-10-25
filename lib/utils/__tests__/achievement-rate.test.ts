/**
 * Achievement Rate Calculation Tests
 */

import { describe, expect, it } from "vitest";
import type { DailyRecord } from "../../types/habit";
import { calculateAchievementRate } from "../achievement-rate";

describe("calculateAchievementRate", () => {
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

  it("記録がない場合、達成率は0%", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    expect(calculateAchievementRate([], startDate)).toBe(0);
  });

  it("全て達成の場合、達成率は100%", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2); // 3日前開始

    const records = [
      createRecord(2, true),
      createRecord(1, true),
      createRecord(0, true),
    ];

    expect(calculateAchievementRate(records, startDate)).toBe(100);
  });

  it("半分達成の場合、達成率は50%", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3); // 4日前開始

    const records = [
      createRecord(3, true),
      createRecord(2, false),
      createRecord(1, true),
      createRecord(0, false),
    ];

    expect(calculateAchievementRate(records, startDate)).toBe(50);
  });

  it("今日が開始日で達成済みの場合、100%", () => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const records = [createRecord(0, true)];

    expect(calculateAchievementRate(records, startDate)).toBe(100);
  });

  it("今日が開始日で未達成の場合、0%", () => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    expect(calculateAchievementRate([], startDate)).toBe(0);
  });
});
