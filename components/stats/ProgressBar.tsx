interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
}

export function ProgressBar({ current, total, color }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{percentage}%</span>
        <span className="text-gray-500">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
