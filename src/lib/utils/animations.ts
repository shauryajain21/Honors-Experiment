import { Variants } from "framer-motion";
import {
  JAR_SLIDE_DURATION,
  JAR_STAGGER_DELAY,
  JAR_SHAKE_DURATION,
  BALL_BOUNCE_DURATION,
  BALL_SLIDE_DELAY,
  JAR_JUMBLE_DURATION,
  JAR_TRANSITION_DURATION,
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

/**
 * Ball slide-in animation (for training trials - balls slide in from left)
 */
export const ballSlideInVariants: Variants = {
  hidden: {
    x: -100,
    opacity: 0,
  },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * (BALL_SLIDE_DELAY / 1000),
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

/**
 * Jar jumble animation (for 101-jar selection screen)
 */
export const jarJumbleVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
    rotate: 0,
  },
  jumble: (i: number) => ({
    x: [0, -5 + Math.random() * 10, 5 - Math.random() * 10, -3 + Math.random() * 6, 0],
    y: [0, 3 - Math.random() * 6, -3 + Math.random() * 6, 2 - Math.random() * 4, 0],
    rotate: [0, -3 + Math.random() * 6, 3 - Math.random() * 6, -1 + Math.random() * 2, 0],
    transition: {
      duration: JAR_JUMBLE_DURATION / 1000,
      times: [0, 0.25, 0.5, 0.75, 1],
      delay: Math.random() * 0.2,
    },
  }),
};

/**
 * Jar slide to left animation (for phase transitions)
 */
export const jarSlideLeftVariants: Variants = {
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
  },
  left: {
    x: -300,
    scale: 0.7,
    opacity: 0.6,
    transition: {
      duration: JAR_TRANSITION_DURATION / 1000,
      ease: "easeInOut",
    },
  },
};

/**
 * Jar slide from right to center animation (for phase transitions)
 */
export const jarSlideFromRightVariants: Variants = {
  right: {
    x: 300,
    scale: 0.7,
    opacity: 0,
  },
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: {
      duration: JAR_TRANSITION_DURATION / 1000,
      ease: "easeInOut",
    },
  },
};
