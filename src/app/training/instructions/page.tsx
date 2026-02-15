"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JarGrid from "@/components/jars/JarGrid";
import { getTrainingJarPercentages } from "@/lib/experiment/jarProbabilities";
import { useAudio } from "@/hooks/useAudio";
import Button from "@/components/ui/Button";

export default function TrainingInstructionsPage() {
  const router = useRouter();
  const { playJarClink } = useAudio();
  const [showSecondPage, setShowSecondPage] = useState(false);
  const [jarsAnimated, setJarsAnimated] = useState(false);

  const trainingJars = getTrainingJarPercentages(); // [0, 10, 20, ..., 100]

  const handleJarsAnimationComplete = () => {
    setJarsAnimated(true);
    playJarClink();
  };

  if (showSecondPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Training Phase</h1>

            <div className="text-left space-y-4 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900">What you will do</h2>
              <p className="text-gray-700">
                On each trial, you will see two jars picked from the array of jars shown earlier.
                You will then see a sample of 10 balls that was drawn from one of the two urns.
              </p>
              <p className="text-gray-700">
                Your task is to decide: <strong>Which urn most likely produced the sample?</strong>
              </p>
              <p className="text-gray-700">
                Select the urn that you believe the sample came from by clicking on it.
              </p>
              <p className="text-gray-600 italic">
                This phase is only to help you understand the task before the main experiment begins.
              </p>
            </div>

            <div className="mt-8">
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
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Training Phase</h1>

          <p className="text-lg text-gray-700">
            Welcome to the training phase. In this task, you will learn how samples of balls relate to the jar they come from.
          </p>

          <div className="space-y-4 text-gray-700">
            <p>
              You will see 11 jars on the screen. Each jar contains 100 balls that can be either black or white.
              The percentage below each jar indicates how many black balls are inside it.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg text-left max-w-2xl mx-auto space-y-2">
              <p><strong>For example:</strong></p>
              <p>• A jar labeled <strong>30%</strong> contains 30 black balls and 70 white balls.</p>
              <p>• A jar labeled <strong>70%</strong> contains 70 black balls and 30 white balls.</p>
            </div>
          </div>

          {/* Jar Grid with Animation */}
          <div className="my-8">
            <JarGrid
              percentages={trainingJars}
              animateIn={true}
              onAnimationComplete={handleJarsAnimationComplete}
              size="sm"
              columns={6}
            />
          </div>

          <p className="text-gray-700">
            The label represents the <strong>probability of drawing a black ball</strong> from that jar.
          </p>

          <div className="mt-8">
            <Button onClick={() => setShowSecondPage(true)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
