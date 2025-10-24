"use client";

import { useMemo } from "react";
import { DateUtils } from "@/lib/utils/dateUtils";
import type { HabitRecord } from "@/types/record";
import { DayCell } from "./DayCell";

interface Calendar100DaysProps {
  habitId: number;
  habitColor: string;
  startDate: string;
  records: HabitRecord[];
  onToggle: (date: string) => Promise<void>;
}

export function Calendar100Days({
  habitId: _habitId,
  habitColor,
  startDate,
  records,
  onToggle,
}: Calendar100DaysProps) {
  const dates = useMemo(
    () => DateUtils.generate100Days(startDate),
    [startDate],
  );

  const recordsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const record of records) {
      map.set(record.date, record.completed);
    }
    return map;
  }, [records]);

  const handleDayClick = async (date: string) => {
    // 未来日はクリックできないようにする
    const today = DateUtils.formatDate(new Date());
    if (date > today) return;

    await onToggle(date);
  };

  const isFutureDate = (date: string) => {
    const today = DateUtils.formatDate(new Date());
    return date > today;
  };

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
      {dates.map((date, index) => (
        <DayCell
          key={date}
          dayNumber={index + 1}
          date={date}
          completed={recordsMap.get(date) ?? null}
          color={habitColor}
          isToday={DateUtils.isToday(date)}
          isFuture={isFutureDate(date)}
          onClick={() => handleDayClick(date)}
        />
      ))}
    </div>
  );
}
