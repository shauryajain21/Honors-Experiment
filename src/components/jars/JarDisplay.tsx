"use client";

import { motion } from "framer-motion";
import { jarShakeVariants } from "@/lib/utils/animations";
import { useId, useMemo } from "react";

interface JarDisplayProps {
  percentage: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  color?: "red" | "green" | "neutral";
  showPercentage?: boolean;
  showBalls?: boolean;
  animate?: boolean;
  onAnimationComplete?: () => void;
}

const sizeClasses = {
  sm: "w-12 h-18",
  md: "w-20 h-30",
  lg: "w-32 h-48",
};

// Translucent body tint based on jar color
const jarBodyFills: Record<string, string> = {
  red: "rgba(239, 68, 68, 0.55)",
  green: "rgba(34, 197, 94, 0.55)",
  neutral: "rgba(200, 215, 230, 0.35)",
};

// Slightly stronger tint for the glass shine overlay
const jarShineFills: Record<string, string> = {
  red: "rgba(252, 165, 165, 0.35)",
  green: "rgba(134, 239, 172, 0.35)",
  neutral: "rgba(255, 255, 255, 0.3)",
};

// Ball layout config per jar size
const ballConfig = {
  sm: { cols: 10, rows: 10, radius: 2.8, startX: 16, startY: 50, spacingX: 6.2, spacingY: 7.5 },
  md: { cols: 10, rows: 10, radius: 2.8, startX: 16, startY: 50, spacingX: 6.2, spacingY: 7.5 },
  lg: { cols: 10, rows: 10, radius: 2.8, startX: 16, startY: 50, spacingX: 6.2, spacingY: 7.5 },
};

function generateBallPositions(percentage: number, size: "sm" | "md" | "lg") {
  const config = ballConfig[size];
  const totalBalls = config.cols * config.rows;
  const blackCount = Math.round((percentage / 100) * totalBalls);

  // Create array of ball colors: black first, then white
  const balls: boolean[] = [];
  for (let i = 0; i < totalBalls; i++) {
    balls.push(i < blackCount);
  }

  // Shuffle using seeded-like deterministic shuffle based on percentage
  // (so the same percentage always looks the same)
  for (let i = balls.length - 1; i > 0; i--) {
    const j = Math.floor(((i * 7 + percentage * 13 + 37) % (i + 1)));
    [balls[i], balls[j]] = [balls[j], balls[i]];
  }

  const positions: { cx: number; cy: number; isBlack: boolean }[] = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const idx = row * config.cols + col;
      positions.push({
        cx: config.startX + col * config.spacingX,
        cy: config.startY + row * config.spacingY,
        isBlack: balls[idx],
      });
    }
  }

  return { positions, radius: config.radius };
}

export default function JarDisplay({
  percentage,
  label,
  size = "md",
  color = "neutral",
  showPercentage = true,
  showBalls = false,
  animate = false,
  onAnimationComplete,
}: JarDisplayProps) {
  const uniqueId = useId();
  const clipId = `jar-clip-${uniqueId}`;
  const gradientId = `jar-grad-${uniqueId}`;

  // Classic rounded jar shape: narrower mouth, wider belly, rounded bottom
  const bodyPath = "M 32 30 L 32 38 Q 32 44 18 48 L 15 48 Q 10 48 10 54 L 10 115 Q 10 132 27 132 L 73 132 Q 90 132 90 115 L 90 54 Q 90 48 85 48 L 82 48 Q 68 44 68 38 L 68 30 Z";

  const ballData = useMemo(
    () => (showBalls ? generateBallPositions(percentage, size) : null),
    [showBalls, percentage, size]
  );

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      variants={animate ? jarShakeVariants : undefined}
      initial={animate ? "initial" : undefined}
      animate={animate ? "shake" : undefined}
      onAnimationComplete={onAnimationComplete}
    >
      {/* Jar visualization */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 145"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={clipId}>
              <path d={bodyPath} />
            </clipPath>
            {/* Subtle vertical gradient for glass depth */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.15" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Jar body — translucent colored fill */}
          <path
            d={bodyPath}
            fill={jarBodyFills[color]}
            stroke="#999"
            strokeWidth="1.8"
          />

          {/* Tiny balls inside the jar */}
          {ballData && (
            <g clipPath={`url(#${clipId})`}>
              {ballData.positions.map((ball, i) => (
                <circle
                  key={i}
                  cx={ball.cx}
                  cy={ball.cy}
                  r={ballData.radius}
                  fill={ball.isBlack ? "#1a1a1a" : "#f0f0f0"}
                  stroke={ball.isBlack ? "#000" : "#ccc"}
                  strokeWidth="0.4"
                />
              ))}
            </g>
          )}

          {/* Glass depth gradient overlay */}
          <path
            d={bodyPath}
            fill={`url(#${gradientId})`}
            clipPath={`url(#${clipId})`}
          />

          {/* Left glass shine */}
          <ellipse
            cx="28"
            cy="80"
            rx="6"
            ry="22"
            fill={jarShineFills[color]}
            clipPath={`url(#${clipId})`}
          />

          {/* Small secondary shine */}
          <ellipse
            cx="25"
            cy="62"
            rx="3"
            ry="8"
            fill="white"
            opacity="0.2"
            clipPath={`url(#${clipId})`}
          />

          {/* Mouth rim — metallic band */}
          <rect x="29" y="27" width="42" height="5" rx="2" fill="#ccc" stroke="#999" strokeWidth="1" />

          {/* Flat screw-top lid */}
          <rect x="26" y="20" width="48" height="8" rx="3" fill="#b0b0b0" stroke="#888" strokeWidth="1" />

          {/* Lid top ridge */}
          <rect x="30" y="18" width="40" height="3" rx="1.5" fill="#c0c0c0" stroke="#999" strokeWidth="0.5" />

          {/* Lid grip lines */}
          <line x1="34" y1="22" x2="34" y2="26" stroke="#999" strokeWidth="0.5" opacity="0.5" />
          <line x1="42" y1="22" x2="42" y2="26" stroke="#999" strokeWidth="0.5" opacity="0.5" />
          <line x1="50" y1="22" x2="50" y2="26" stroke="#999" strokeWidth="0.5" opacity="0.5" />
          <line x1="58" y1="22" x2="58" y2="26" stroke="#999" strokeWidth="0.5" opacity="0.5" />
          <line x1="66" y1="22" x2="66" y2="26" stroke="#999" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      {/* Percentage label (only for training/instruction grids) */}
      {showPercentage && (
        <div className="text-sm font-semibold text-gray-700">
          {percentage}%
        </div>
      )}
    </motion.div>
  );
}
