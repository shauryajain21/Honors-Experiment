"use client";

import { motion } from "framer-motion";
import { jarShakeVariants } from "@/lib/utils/animations";

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
  const labelColors = {
    red: "bg-red-500",
    green: "bg-green-500",
    neutral: "bg-gray-400",
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
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
        {/* Jar outline */}
        <svg
          viewBox="0 0 100 140"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Jar body */}
          <path
            d="M 30 20 L 30 120 Q 30 130 40 130 L 60 130 Q 70 130 70 120 L 70 20 Q 70 15 65 15 L 35 15 Q 30 15 30 20 Z"
            fill="none"
            stroke="#666"
            strokeWidth="2"
          />

          {/* Jar neck */}
          <rect x="40" y="5" width="20" height="15" fill="none" stroke="#666" strokeWidth="2" />

          {/* Jar lid */}
          <rect x="35" y="2" width="30" height="5" fill="#999" stroke="#666" strokeWidth="1" />

          {/* Fill level (black balls representation) */}
          <defs>
            <clipPath id={`jar-clip-${percentage}-${size}`}>
              <path d="M 30 20 L 30 120 Q 30 130 40 130 L 60 130 Q 70 130 70 120 L 70 20 Z" />
            </clipPath>
          </defs>
          <rect
            x="30"
            y={20 + (100 * (100 - percentage)) / 100}
            width="40"
            height={(100 * percentage) / 100}
            fill="#1a1a1a"
            clipPath={`url(#jar-clip-${percentage}-${size})`}
            opacity="0.8"
          />

          {/* Glass shine effect */}
          <ellipse cx="45" cy="40" rx="8" ry="15" fill="white" opacity="0.2" />
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
