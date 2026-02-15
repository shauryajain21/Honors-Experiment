"use client";

import Ball from "./Ball";
import { BallColor } from "@/store/experimentStore";

interface BallSequenceProps {
  balls: BallColor[];
  maxVisible?: number;
  size?: number;
  showCount?: boolean;
}

export default function BallSequence({
  balls,
  maxVisible = 40,
  size = 30,
  showCount = true,
}: BallSequenceProps) {
  // Show the most recent balls if exceeds maxVisible
  const displayBalls = balls.length > maxVisible
    ? balls.slice(balls.length - maxVisible)
    : balls;

  if (balls.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        No balls drawn yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showCount && (
        <div className="text-sm font-semibold text-gray-700">
          Balls drawn: {balls.length}
          {balls.length > maxVisible && ` (showing last ${maxVisible})`}
        </div>
      )}

      <div className="flex flex-wrap gap-2 p-4 bg-gray-100 rounded-lg max-h-32 overflow-y-auto">
        {displayBalls.map((color, index) => (
          <Ball
            key={`ball-${index}`}
            color={color}
            size={size}
            animate={false}
          />
        ))}
      </div>

      {/* Statistics */}
      <div className="text-xs text-gray-600 flex gap-4">
        <span>
          Black: {balls.filter(b => b === "black").length}
        </span>
        <span>
          White: {balls.filter(b => b === "white").length}
        </span>
        <span>
          Black %: {balls.length > 0
            ? Math.round((balls.filter(b => b === "black").length / balls.length) * 100)
            : 0}%
        </span>
      </div>
    </div>
  );
}
