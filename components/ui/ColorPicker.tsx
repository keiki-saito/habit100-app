import { HABIT_COLORS } from "@/lib/constants/colors";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="mb-2 block text-sm font-medium text-gray-700">
        カラー
      </legend>
      <div className="flex flex-wrap gap-2">
        {HABIT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`h-10 w-10 rounded-full transition-transform hover:scale-110 ${
              value === color.value ? "ring-2 ring-gray-400 ring-offset-2" : ""
            }`}
            style={{ backgroundColor: color.value }}
            aria-label={color.name}
          />
        ))}
      </div>
    </fieldset>
  );
}
