"use client";

import { motion } from "framer-motion";
import { jarShakeVariants } from "@/lib/utils/animations";
import { useId } from "react";

interface JarDisplayProps {
  percentage: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  color?: "red" | "green" | "neutral";
  showPercentage?: boolean;
  animate?: boolean;
  onAnimationComplete?: () => void;
}

const sizeClasses = {
  sm: "w-12 h-16",
  md: "w-20 h-28",
  lg: "w-32 h-44",
};

export default function JarDisplay({
  percentage,
  label,
  size = "md",
  color = "neutral",
  showPercentage = true,
  animate = false,
  onAnimationComplete,
}: JarDisplayProps) {
  const uniqueId = useId();
  const clipId = `jar-clip-${uniqueId}`;

  const labelColors = {
    red: "bg-red-500",
    green: "bg-green-500",
    neutral: "bg-gray-400",
  };

  // The jar body path: wide mouth jar with rounded bottom
  // Body runs from y=30 (top of body) to y=130 (bottom)
  const bodyPath = "M 15 30 L 15 115 Q 15 130 30 130 L 70 130 Q 85 130 85 115 L 85 30 Z";
  // Fill area height: body is 100 units tall (y 30 to 130)
  const fillY = 30 + (100 * (100 - percentage)) / 100;
  const fillHeight = (100 * percentage) / 100;

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      variants={animate ? jarShakeVariants : undefined}
      initial={animate ? "initial" : undefined}
      animate={animate ? "shake" : undefined}
      onAnimationComplete={onAnimationComplete}
    >
      {/* Label tag if provided */}
      {label && (
        <div className={`${labelColors[color]} text-white px-3 py-1 rounded-full text-sm font-bold`}>
          {label}
        </div>
      )}

      {/* Jar visualization */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 140"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Clip path for fill */}
          <defs>
            <clipPath id={clipId}>
              <path d={bodyPath} />
            </clipPath>
          </defs>

          {/* Jar body outline */}
          <path
            d={bodyPath}
            fill="white"
            stroke="#888"
            strokeWidth="2"
          />

          {/* Fill level (black balls representation) */}
          {percentage > 0 && (
            <rect
              x="15"
              y={fillY}
              width="70"
              height={fillHeight}
              fill="#1a1a1a"
              clipPath={`url(#${clipId})`}
              opacity="0.85"
            />
          )}

          {/* Glass shine effect */}
          <ellipse cx="35" cy="60" rx="8" ry="20" fill="white" opacity="0.25" />

          {/* Jar rim / lip at top of body */}
          <rect x="12" y="27" width="76" height="5" rx="2" fill="#bbb" stroke="#888" strokeWidth="1" />

          {/* Dome lid */}
          <path
            d="M 25 28 Q 25 10 50 8 Q 75 10 75 28"
            fill="#c8a262"
            stroke="#a08040"
            strokeWidth="1.5"
          />
          {/* Lid highlight */}
          <path
            d="M 35 22 Q 35 14 50 13 Q 55 13 55 16"
            fill="none"
            stroke="#ddc080"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Lid knob */}
          <circle cx="50" cy="10" r="3" fill="#b89850" stroke="#a08040" strokeWidth="1" />
        </svg>
      </div>

      {/* Percentage label */}
      {showPercentage && (
        <div className="text-sm font-semibold text-gray-700">
          {percentage}%
        </div>
      )}
    </motion.div>
  );
}
