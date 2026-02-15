"use client";

import { motion } from "framer-motion";
import { ballBounceVariants } from "@/lib/utils/animations";
import { BallColor } from "@/store/experimentStore";

interface BallProps {
  color: BallColor;
  size?: number;
  animate?: boolean;
  onAnimationComplete?: () => void;
}

export default function Ball({
  color,
  size = 40,
  animate = false,
  onAnimationComplete,
}: BallProps) {
  const ballColor = color === "black" ? "#1a1a1a" : "#f5f5f5";
  const borderColor = color === "black" ? "#000" : "#d4d4d4";

  return (
    <motion.div
      className="inline-block"
      variants={animate ? ballBounceVariants : undefined}
      initial={animate ? "initial" : undefined}
      animate={animate ? "animate" : undefined}
      onAnimationComplete={onAnimationComplete}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main ball circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={ballColor}
          stroke={borderColor}
          strokeWidth="3"
        />

        {/* Highlight for 3D effect */}
        <ellipse
          cx="40"
          cy="35"
          rx="15"
          ry="20"
          fill="white"
          opacity="0.4"
        />

        {/* Shadow for depth */}
        <ellipse
          cx="60"
          cy="70"
          rx="20"
          ry="15"
          fill="black"
          opacity="0.2"
        />
      </svg>
    </motion.div>
  );
}
