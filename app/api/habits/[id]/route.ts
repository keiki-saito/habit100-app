import { type NextRequest, NextResponse } from "next/server";
import { HabitService } from "@/lib/services/habitService";
import type { UpdateHabitData } from "@/types/habit";

// PATCH /api/habits/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const habitId = Number.parseInt(id, 10);
    const body: UpdateHabitData = await request.json();

    const habit = HabitService.updateHabit(habitId, body);
    return NextResponse.json({ habit });
  } catch (_error) {
    return NextResponse.json(
      { error: { message: "Failed to update habit", code: "DATABASE_ERROR" } },
      { status: 500 },
    );
  }
}

// DELETE /api/habits/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const habitId = Number.parseInt(id, 10);
    HabitService.deleteHabit(habitId);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: { message: "Failed to delete habit", code: "DATABASE_ERROR" } },
      { status: 500 },
    );
  }
}
