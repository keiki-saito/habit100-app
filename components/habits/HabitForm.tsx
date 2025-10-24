"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { HABIT_COLORS } from "@/lib/constants/colors";
import { DateUtils } from "@/lib/utils/dateUtils";
import type { Habit } from "@/types/habit";

interface HabitFormProps {
  habit?: Habit;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => Promise<void>;
}

interface HabitFormData {
  name: string;
  color: string;
  startDate: string;
}

export function HabitForm({
  habit,
  isOpen,
  onClose,
  onSubmit,
}: HabitFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(HABIT_COLORS[0].value);
  const [startDate, setStartDate] = useState(DateUtils.formatDate(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // habitプロップまたはisOpenが変化したときにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      if (habit) {
        // 編集モード: habitの値をセット
        setName(habit.name);
        setColor(habit.color);
        setStartDate(habit.startDate);
      } else {
        // 新規作成モード: デフォルト値をセット
        setName("");
        setColor(HABIT_COLORS[0].value);
        setStartDate(DateUtils.formatDate(new Date()));
      }
      setError("");
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length === 0 || name.length > 50) {
      setError("習慣名は1〜50文字で入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), color, startDate });
      onClose();
    } catch {
      setError("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? "習慣を編集" : "新しい習慣"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="習慣名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 筋トレ、読書、瞑想"
          error={error}
          maxLength={50}
        />

        <ColorPicker value={color} onChange={setColor} />

        <Input
          type="date"
          label="開始日"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : habit ? "更新" : "作成"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
