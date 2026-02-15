"use client";

import { motion } from "framer-motion";
import JarDisplay from "./JarDisplay";
import { jarSlideVariants } from "@/lib/utils/animations";

interface JarGridProps {
  percentages: number[];
  animateIn?: boolean;
  onAnimationComplete?: () => void;
  size?: "sm" | "md" | "lg";
  columns?: number;
}

export default function JarGrid({
  percentages,
  animateIn = true,
  onAnimationComplete,
  size = "sm",
  columns,
}: JarGridProps) {
  // Automatically determine columns based on number of jars
  const gridColumns = columns || (percentages.length === 11 ? 6 : 10);

  return (
    <div
      className="grid gap-4 justify-items-center"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
      }}
    >
      {percentages.map((percentage, index) => (
        <motion.div
          key={`jar-${percentage}-${index}`}
          variants={animateIn ? jarSlideVariants : undefined}
          initial={animateIn ? "hidden" : "visible"}
          animate="visible"
          custom={index}
          onAnimationComplete={
            index === percentages.length - 1 ? onAnimationComplete : undefined
          }
        >
          <JarDisplay
            percentage={percentage}
            size={size}
            showPercentage={true}
            color="neutral"
          />
        </motion.div>
      ))}
    </div>
  );
}
