/**
 * Generates an array of jar percentages for display
 * @param count - Number of jars (11 or 101)
 * @returns Array of percentages
 */
export function generateJarPercentages(count: 11 | 101): number[] {
  const step = 100 / (count - 1);
  const percentages: number[] = [];

  for (let i = 0; i < count; i++) {
    percentages.push(Math.round(i * step));
  }

  return percentages;
}

/**
 * Gets jar percentages for training (0%, 10%, 20%, ..., 100%)
 * @returns Array of 11 percentages
 */
export function getTrainingJarPercentages(): number[] {
  return generateJarPercentages(11);
}

/**
 * Gets jar percentages for main experiment (0%, 1%, 2%, ..., 100%)
 * @returns Array of 101 percentages
 */
export function getMainExperimentJarPercentages(): number[] {
  return generateJarPercentages(101);
}

/**
 * Generates a random incorrect jar percentage for training trials
 * @param correctPercentage - The correct jar percentage
 * @param minDifference - Minimum difference from correct (default 20)
 * @returns A different jar percentage
 */
export function generateIncorrectJarPercentage(
  correctPercentage: number,
  minDifference: number = 20
): number {
  const trainingJars = getTrainingJarPercentages();
  const validOptions = trainingJars.filter(
    (p) => Math.abs(p - correctPercentage) >= minDifference
  );

  if (validOptions.length === 0) {
    // If no valid options, just pick a different percentage
    const different = trainingJars.filter((p) => p !== correctPercentage);
    return different[Math.floor(Math.random() * different.length)];
  }

  return validOptions[Math.floor(Math.random() * validOptions.length)];
}
