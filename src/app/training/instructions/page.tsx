"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JarGrid from "@/components/jars/JarGrid";
import { getTrainingJarPercentages } from "@/lib/experiment/jarProbabilities";
import { useAudio } from "@/hooks/useAudio";
import Button from "@/components/ui/Button";
import WizardNarration from "@/components/wizard/WizardNarration";

const PAGE1_STEPS = [
  "Welcome to the training phase! In this task, you will learn how samples of balls relate to the jar they come from.",
  "You will see 11 jars on the screen. Each jar contains 100 balls that can be either black or white. The percentage below each jar indicates how many black balls are inside it.",
  "For example: A jar labeled 30% contains 30 black balls and 70 white balls. A jar labeled 70% contains 70 black balls and 30 white balls.",
  "The label represents the probability of drawing a black ball from that jar.",
];

const PAGE2_STEPS = [
  "On each trial, you will see two jars picked from the array of jars shown earlier.",
  "You will then see a sample of 10 balls that was drawn from one of the two urns.",
  "Your task is to decide: Which urn most likely produced the sample? Select the urn that you believe the sample came from by clicking on it.",
  "This phase is only to help you understand the task before the main experiment begins.",
];

export default function TrainingInstructionsPage() {
  const router = useRouter();
  const { playJarClink } = useAudio();
  const [showSecondPage, setShowSecondPage] = useState(false);
  const [jarsAnimated, setJarsAnimated] = useState(false);

  const trainingJars = getTrainingJarPercentages();

  const handleJarsAnimationComplete = () => {
    setJarsAnimated(true);
    playJarClink();
  };

  if (showSecondPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-4xl">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">Training Phase</h1>

            <WizardNarration steps={PAGE2_STEPS} />

            <div className="text-center mt-8">
              <Button onClick={() => router.push("/training/trials")}>
                Begin Training
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-6xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Training Phase</h1>

          <WizardNarration steps={PAGE1_STEPS} />

          {/* Jar Grid with Animation */}
          <div className="my-8">
            <JarGrid
              percentages={trainingJars}
              animateIn={true}
              onAnimationComplete={handleJarsAnimationComplete}
              size="sm"
              columns={6}
              showBalls={true}
            />
          </div>

          <div className="text-center mt-8">
            <Button onClick={() => setShowSecondPage(true)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
