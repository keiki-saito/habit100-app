import { type NextRequest, NextResponse } from "next/server";
import { HabitService } from "@/lib/services/habitService";
import { RecordService } from "@/lib/services/recordService";
import { DateUtils } from "@/lib/utils/dateUtils";
import type { UpsertRecordData } from "@/types/record";

// GET /api/records?habitId=1&startDate=2024-01-01&endDate=2024-04-10
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const habitId = Number.parseInt(searchParams.get("habitId") || "", 10);

    if (!habitId) {
      return NextResponse.json(
        { error: { message: "habitId is required", code: "INVALID_INPUT" } },
        { status: 400 },
      );
    }

    const habit = HabitService.getHabitById(habitId);
    if (!habit) {
      return NextResponse.json(
        { error: { message: "Habit not found", code: "HABIT_NOT_FOUND" } },
        { status: 404 },
      );
    }

    const startDate = searchParams.get("startDate") || habit.startDate;
    const endDate =
      searchParams.get("endDate") || DateUtils.addDays(startDate, 99);

    const records = RecordService.getRecordsByHabit(
      habitId,
      startDate,
      endDate,
    );
    return NextResponse.json({ records });
  } catch (_error) {
    return NextResponse.json(
      {
        error: { message: "Failed to fetch records", code: "DATABASE_ERROR" },
      },
      { status: 500 },
    );
  }
}

// POST /api/records (upsert)
export async function POST(request: NextRequest) {
  try {
    const body: UpsertRecordData = await request.json();

    const record = RecordService.upsertRecord(body);
    return NextResponse.json({ record }, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: { message: "Failed to save record", code: "DATABASE_ERROR" } },
      { status: 500 },
    );
  }
}
