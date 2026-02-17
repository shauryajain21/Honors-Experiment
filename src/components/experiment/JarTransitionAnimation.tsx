"use client";

import { motion } from "framer-motion";
import JarDisplay from "@/components/jars/JarDisplay";
import { JAR_TRANSITION_DURATION } from "@/lib/utils/constants";

interface JarTransitionAnimationProps {
  exitingJar: { color: "red" | "green"; percentage: number };
  enteringJar: { color: "red" | "green"; percentage: number };
  onComplete: () => void;
  /**
   * "swap" — both jars move simultaneously (entering comes from side position, exiting goes to side)
   * "slide" — exiting slides left and entering slides in from the right (default for Phase 1→2)
   */
  mode?: "swap" | "slide";
}

const duration = JAR_TRANSITION_DURATION / 1000;

export default function JarTransitionAnimation({
  exitingJar,
  enteringJar,
  onComplete,
  mode = "slide",
}: JarTransitionAnimationProps) {
  if (mode === "swap") {
    // Simultaneous swap: entering jar comes from the left side position to center,
    // exiting jar goes from center to the left side position.
    return (
      <div className="jar-stage">
        <div className="relative flex items-center justify-center min-h-[300px]">
          {/* Entering jar: starts at side position (left, small, faded), moves to center */}
          <motion.div
            initial={{ x: -150, scale: 0.75, opacity: 0.5 }}
            animate={{ x: 0, scale: 1, opacity: 1 }}
            transition={{ duration, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
            className="absolute"
          >
            <JarDisplay
              percentage={enteringJar.percentage}
              size="lg"
              color={enteringJar.color}
              showPercentage={false}
            />
          </motion.div>

          {/* Exiting jar: starts at center, moves to left side position (small, faded) */}
          <motion.div
            initial={{ x: 0, scale: 1, opacity: 1 }}
            animate={{ x: -150, scale: 0.75, opacity: 0.5 }}
            transition={{ duration, ease: "easeInOut" }}
            className="absolute"
          >
            <JarDisplay
              percentage={exitingJar.percentage}
              size="lg"
              color={exitingJar.color}
              showPercentage={false}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Default "slide" mode: exiting slides left and disappears, entering slides in from right
  return (
    <div className="jar-stage">
      <div className="relative flex items-center justify-center min-h-[300px]">
        {/* Exiting jar slides to the left and shrinks */}
        <motion.div
          initial={{ x: 0, scale: 1, opacity: 1 }}
          animate={{ x: -200, scale: 0.7, opacity: 0 }}
          transition={{ duration, ease: "easeInOut" }}
          className="absolute"
        >
          <JarDisplay
            percentage={exitingJar.percentage}
            size="lg"
            color={exitingJar.color}
            showPercentage={false}
          />
        </motion.div>

        {/* Entering jar slides in from the right */}
        <motion.div
          initial={{ x: 200, scale: 0.7, opacity: 0 }}
          animate={{ x: 0, scale: 1, opacity: 1 }}
          transition={{ duration, ease: "easeInOut", delay: duration * 0.3 }}
          onAnimationComplete={onComplete}
          className="absolute"
        >
          <JarDisplay
            percentage={enteringJar.percentage}
            size="lg"
            color={enteringJar.color}
            showPercentage={false}
          />
        </motion.div>
      </div>
    </div>
  );
}
