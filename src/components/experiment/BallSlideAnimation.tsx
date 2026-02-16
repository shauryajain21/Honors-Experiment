"use client";

import { motion } from "framer-motion";
import Ball from "@/components/balls/Ball";
import { BallColor } from "@/store/experimentStore";
import { ballSlideInVariants } from "@/lib/utils/animations";
import { useAudio } from "@/hooks/useAudio";
import { useEffect, useState } from "react";
import { BALL_SLIDE_DELAY } from "@/lib/utils/constants";

interface BallSlideAnimationProps {
  balls: BallColor[];
  onComplete: () => void;
  ballSize?: number;
}

export default function BallSlideAnimation({
  balls,
  onComplete,
  ballSize = 40,
}: BallSlideAnimationProps) {
  const { playBallBounce } = useAudio();
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    // Play bounce sound for each ball as it appears
    if (animatedCount > 0 && animatedCount <= balls.length) {
      playBallBounce();
    }
    if (animatedCount === balls.length && balls.length > 0) {
      onComplete();
    }
  }, [animatedCount, balls.length, onComplete, playBallBounce]);

  // Use timers to track when each ball animation starts
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    balls.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedCount((prev) => prev + 1);
      }, i * BALL_SLIDE_DELAY + 300); // 300ms is the animation duration
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [balls]);

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4 bg-gray-50 rounded-lg min-h-[60px]">
      {balls.map((color, index) => (
        <motion.div
          key={`slide-ball-${index}`}
          variants={ballSlideInVariants}
          initial="hidden"
          animate="visible"
          custom={index}
        >
          <Ball color={color} size={ballSize} />
        </motion.div>
      ))}
    </div>
  );
}
