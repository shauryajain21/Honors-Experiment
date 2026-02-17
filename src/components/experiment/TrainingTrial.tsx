"use client";

import { useState, useMemo, useCallback } from "react";
import BallSlideAnimation from "./BallSlideAnimation";
import JarDisplay from "@/components/jars/JarDisplay";
import Button from "@/components/ui/Button";
import { generateTrainingSample, calculateBlackPercentage } from "@/lib/experiment/ballDrawing";
import { generateIncorrectJarPercentage } from "@/lib/experiment/jarProbabilities";
import { TrainingTrialData } from "@/store/experimentStore";
import { TRAINING_SAMPLE_SIZE } from "@/lib/utils/constants";

interface TrainingTrialProps {
  trialNumber: number;
  onComplete: (data: TrainingTrialData) => void;
}

export default function TrainingTrial({ trialNumber, onComplete }: TrainingTrialProps) {
  const [ballsAnimated, setBallsAnimated] = useState(false);
  const [selectedJar, setSelectedJar] = useState<number | null>(null);

  // Generate sample and jar options (memoized so they don't change on re-render)
  const trialData = useMemo(() => {
    const sampleBalls = generateTrainingSample(TRAINING_SAMPLE_SIZE);
    const blackPercentage = calculateBlackPercentage(sampleBalls);
    // Round to nearest 10 to match training jar percentages
    const correctJar = Math.round(blackPercentage / 10) * 10;
    const incorrectJar = generateIncorrectJarPercentage(correctJar);
    // Randomly decide which side the correct jar goes on
    const correctOnLeft = Math.random() < 0.5;
    return {
      sampleBalls,
      correctJar,
      incorrectJar,
      correctOnLeft,
      leftJar: correctOnLeft ? correctJar : incorrectJar,
      rightJar: correctOnLeft ? incorrectJar : correctJar,
    };
  }, [trialNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBallsComplete = useCallback(() => {
    setBallsAnimated(true);
  }, []);

  const handleJarSelect = (jarPercentage: number) => {
    if (selectedJar !== null) return; // prevent double-click
    setSelectedJar(jarPercentage);
  };

  const handleNext = () => {
    if (selectedJar === null) return;
    onComplete({
      trialNumber,
      timestamp: new Date().toISOString(),
      sampleBalls: trialData.sampleBalls,
      correctJar: trialData.correctJar,
      incorrectJar: trialData.incorrectJar,
      selectedJar,
      isCorrect: selectedJar === trialData.correctJar,
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-lg text-gray-700 text-center">
        Which urn out of the two shown below most likely produced the sample?
      </p>

      {/* Ball sample animation */}
      <BallSlideAnimation
        balls={trialData.sampleBalls}
        onComplete={handleBallsComplete}
        ballSize={36}
      />

      {/* Two jars to choose from */}
      {ballsAnimated && (
        <div className="jar-stage">
          <div className="flex justify-center gap-16">
            {[
              { percentage: trialData.leftJar, side: "left" },
              { percentage: trialData.rightJar, side: "right" },
            ].map(({ percentage, side }) => (
              <button
                key={side}
                onClick={() => handleJarSelect(percentage)}
                className={`p-4 rounded-xl transition-all ${
                  selectedJar === percentage
                    ? "ring-4 ring-nyu-purple bg-purple-50"
                    : selectedJar !== null
                    ? "opacity-50"
                    : "hover:bg-gray-50 hover:ring-2 hover:ring-gray-300"
                }`}
                disabled={selectedJar !== null}
              >
                <JarDisplay
                  percentage={percentage}
                  size="md"
                  color="neutral"
                  showPercentage={true}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next button */}
      {selectedJar !== null && (
        <div className="text-center mt-6">
          <Button onClick={handleNext}>Next</Button>
        </div>
      )}
    </div>
  );
}
