"use client";

import { useEffect, useState } from "react";

interface CompletionCelebrationProps {
  isComplete: boolean;
  habitName: string;
  habitColor: string;
  onClose: () => void;
}

export function CompletionCelebration({
  isComplete,
  habitName,
  habitColor,
  onClose,
}: CompletionCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setShow(true);
    }
  }, [isComplete]);

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  if (!show) return null;

  return (
    <button
      type="button"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 cursor-pointer border-0 p-0"
      onClick={handleClose}
      aria-label="お祝いメッセージを閉じる"
    >
      {/* 紙吹雪アニメーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={`confetti-${i}-${Math.random()}`}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <div
              className={`${
                i % 3 === 0 ? "h-4 w-4" : i % 3 === 1 ? "h-3 w-3" : "h-2 w-2"
              } rounded-sm shadow-lg`}
              style={{
                backgroundColor: [
                  habitColor,
                  "#3B82F6",
                  "#10B981",
                  "#F59E0B",
                  "#8B5CF6",
                  "#EC4899",
                  "#EF4444",
                  "#14B8A6",
                ][i % 8],
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* 達成メッセージ */}
      <div className="relative animate-celebration-bounce pointer-events-auto">
        <div
          className="rounded-2xl bg-white p-8 shadow-2xl border-4 relative overflow-hidden"
          style={{ borderColor: habitColor }}
        >
          {/* 背景の輝きエフェクト */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: habitColor }}
            />
            <div
              className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: habitColor, animationDelay: "1s" }}
            />
          </div>

          <div className="text-center relative z-10">
            <div className="mb-4 text-6xl animate-bounce">🎉</div>
            <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              おめでとうございます!
            </h2>
            <p className="mb-4 text-xl text-gray-600">
              「{habitName}」を100日達成しました!
            </p>
            <div
              className="mx-auto h-2 w-64 rounded-full shadow-lg"
              style={{ backgroundColor: habitColor }}
            />
            <p className="mt-6 text-sm text-gray-500">素晴らしい継続力です!</p>
          </div>
        </div>
      </div>
    </button>
  );
}
