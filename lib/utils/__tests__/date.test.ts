/**
 * Date Utility Tests
 */

import { describe, expect, it } from "vitest";
import { formatDate, getDaysSince, isSameDay, isToday } from "../date";

describe("isSameDay", () => {
  it("同じ日付の場合、trueを返す", () => {
    const date1 = new Date(2025, 0, 15, 10, 30);
    const date2 = new Date(2025, 0, 15, 18, 45);
    expect(isSameDay(date1, date2)).toBe(true);
  });

  it("異なる日付の場合、falseを返す", () => {
    const date1 = new Date(2025, 0, 15);
    const date2 = new Date(2025, 0, 16);
    expect(isSameDay(date1, date2)).toBe(false);
  });

  it("異なる月の場合、falseを返す", () => {
    const date1 = new Date(2025, 0, 15);
    const date2 = new Date(2025, 1, 15);
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe("getDaysSince", () => {
  it("今日が開始日の場合、1を返す", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(getDaysSince(today)).toBe(1);
  });

  it("3日前が開始日の場合、4を返す", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(getDaysSince(threeDaysAgo)).toBe(4);
  });

  it("10日前が開始日の場合、11を返す", () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    expect(getDaysSince(tenDaysAgo)).toBe(11);
  });
});

describe("isToday", () => {
  it("今日の日付の場合、trueを返す", () => {
    const today = new Date();
    expect(isToday(today)).toBe(true);
  });

  it("昨日の日付の場合、falseを返す", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  it("明日の日付の場合、falseを返す", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe("formatDate", () => {
  it("YYYY-MM-DD形式で日付をフォーマット", () => {
    const date = new Date(2025, 0, 15); // 2025年1月15日
    expect(formatDate(date)).toBe("2025-01-15");
  });

  it("1桁の月日はゼロパディング", () => {
    const date = new Date(2025, 0, 5); // 2025年1月5日
    expect(formatDate(date)).toBe("2025-01-05");
  });
});
