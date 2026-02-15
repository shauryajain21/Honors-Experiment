import { Variants } from "framer-motion";
import {
  JAR_SLIDE_DURATION,
  JAR_STAGGER_DELAY,
  JAR_SHAKE_DURATION,
  BALL_BOUNCE_DURATION,
} from "./constants";

/**
 * Jar slide-in animation (used for jar grids)
 * Jars slide in from left with staggered timing
 */
export const jarSlideVariants: Variants = {
  hidden: {
    x: -200,
    opacity: 0,
  },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * (JAR_STAGGER_DELAY / 1000),
      duration: JAR_SLIDE_DURATION / 1000,
      ease: "easeOut",
    },
  }),
};

/**
 * Jar shake animation (before drawing a ball)
 */
export const jarShakeVariants: Variants = {
  initial: { rotate: 0 },
  shake: {
    rotate: [-2, 2, -2, 2, -1, 1, 0],
    transition: {
      duration: JAR_SHAKE_DURATION / 1000,
      times: [0, 0.2, 0.4, 0.6, 0.75, 0.9, 1],
    },
  },
};

/**
 * Ball bounce animation (when ball is drawn)
 * Simulates a ball bouncing out of the jar
 */
export const ballBounceVariants: Variants = {
  initial: {
    y: -100,
    scale: 0,
    opacity: 0,
  },
  animate: {
    y: [0, -30, 0, -15, 0],
    scale: [1, 1, 1, 1, 1],
    opacity: [1, 1, 1, 1, 1],
    transition: {
      duration: BALL_BOUNCE_DURATION / 1000,
      times: [0, 0.3, 0.5, 0.7, 1],
      ease: "easeOut",
    },
  },
};

/**
 * Fade in animation (generic)
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Scale in animation (for modals/popups)
 */
export const scaleInVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

/**
 * Slide up animation (for cards/panels)
 */
export const slideUpVariants: Variants = {
  hidden: {
    y: 50,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Pulse animation (for attention-grabbing elements)
 */
export const pulseVariants: Variants = {
  initial: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
