import { BallColor } from "@/store/experimentStore";

/**
 * Draws a ball from a jar based on the jar's black ball percentage
 * @param jarPercentage - Percentage of black balls in the jar (0-100)
 * @returns 'black' or 'white' based on probability
 */
export function drawBall(jarPercentage: number): BallColor {
  const random = Math.random() * 100;
  return random < jarPercentage ? "black" : "white";
}

/**
 * Generates a sequence of ball draws for testing
 * @param jarPercentage - Percentage of black balls in the jar (0-100)
 * @param count - Number of balls to draw
 * @returns Array of ball colors
 */
export function drawBalls(jarPercentage: number, count: number): BallColor[] {
  const balls: BallColor[] = [];
  for (let i = 0; i < count; i++) {
    balls.push(drawBall(jarPercentage));
  }
  return balls;
}

/**
 * Validates that the ball drawing probability is working correctly
 * @param jarPercentage - Percentage of black balls
 * @param trials - Number of trials to run
 * @returns Actual percentage of black balls drawn
 */
export function validateProbability(
  jarPercentage: number,
  trials: number = 10000
): number {
  const balls = drawBalls(jarPercentage, trials);
  const blackCount = balls.filter((b) => b === "black").length;
  return (blackCount / trials) * 100;
}

/**
 * Generates a sample of balls for training trials
 * @param sampleSize - Number of balls in sample (default 10)
 * @returns Array of ball colors with random distribution
 */
export function generateTrainingSample(sampleSize: number = 10): BallColor[] {
  const blackCount = Math.floor(Math.random() * (sampleSize + 1));
  const balls: BallColor[] = [];

  for (let i = 0; i < blackCount; i++) {
    balls.push("black");
  }
  for (let i = 0; i < sampleSize - blackCount; i++) {
    balls.push("white");
  }

  // Shuffle the array
  return shuffleArray(balls);
}

/**
 * Calculates the percentage of black balls in a sample
 * @param balls - Array of ball colors
 * @returns Percentage of black balls (0-100)
 */
export function calculateBlackPercentage(balls: BallColor[]): number {
  if (balls.length === 0) return 0;
  const blackCount = balls.filter((b) => b === "black").length;
  return Math.round((blackCount / balls.length) * 100);
}

/**
 * Fisher-Yates shuffle algorithm
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
