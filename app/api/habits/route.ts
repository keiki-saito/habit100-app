import { type NextRequest, NextResponse } from "next/server";
import { HabitService } from "@/lib/services/habitService";
import type { CreateHabitData } from "@/types/habit";

// GET /api/habits
export async function GET() {
  try {
    const habits = HabitService.getAllHabits();
    return NextResponse.json({ habits });
  } catch (_error) {
    return NextResponse.json(
      { error: { message: "Failed to fetch habits", code: "DATABASE_ERROR" } },
      { status: 500 },
    );
  }
}

// POST /api/habits
export async function POST(request: NextRequest) {
  try {
    const body: CreateHabitData = await request.json();

    // バリデーション
    if (!body.name || body.name.length > 50) {
      return NextResponse.json(
        { error: { message: "Invalid habit name", code: "INVALID_INPUT" } },
        { status: 400 },
      );
    }

    const habit = HabitService.createHabit(body);
    return NextResponse.json({ habit }, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: { message: "Failed to create habit", code: "DATABASE_ERROR" } },
      { status: 500 },
    );
  }
}
