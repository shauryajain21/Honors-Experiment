"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import JarDisplay from "@/components/jars/JarDisplay";
import { jarSlideLeftVariants, jarSlideFromRightVariants } from "@/lib/utils/animations";

interface JarTransitionAnimationProps {
  exitingJar: { color: "red" | "green"; percentage: number };
  enteringJar: { color: "red" | "green"; percentage: number };
  onComplete: () => void;
}

export default function JarTransitionAnimation({
  exitingJar,
  enteringJar,
  onComplete,
}: JarTransitionAnimationProps) {
  const [exitComplete, setExitComplete] = useState(false);

  return (
    <div className="relative flex items-center justify-center min-h-[300px]">
      {/* Exiting jar slides to the left */}
      <motion.div
        variants={jarSlideLeftVariants}
        initial="center"
        animate="left"
        onAnimationComplete={() => setExitComplete(true)}
        className="absolute"
      >
        <JarDisplay
          percentage={exitingJar.percentage}
          size="lg"
          color={exitingJar.color}
          label={exitingJar.color === "red" ? "Red" : "Green"}
          showPercentage={false}
        />
      </motion.div>

      {/* Entering jar slides in from the right */}
      {exitComplete && (
        <motion.div
          variants={jarSlideFromRightVariants}
          initial="right"
          animate="center"
          onAnimationComplete={onComplete}
        >
          <JarDisplay
            percentage={enteringJar.percentage}
            size="lg"
            color={enteringJar.color}
            label={enteringJar.color === "red" ? "Red" : "Green"}
            showPercentage={false}
          />
        </motion.div>
      )}
    </div>
  );
}
