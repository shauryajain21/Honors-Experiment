"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JarGrid from "@/components/jars/JarGrid";
import { getMainExperimentJarPercentages } from "@/lib/experiment/jarProbabilities";
import { useAudio } from "@/hooks/useAudio";
import Button from "@/components/ui/Button";

export default function MainInstructionsPage() {
  const router = useRouter();
  const { playJarClink } = useAudio();
  const [jarsAnimated, setJarsAnimated] = useState(false);

  const mainJars = getMainExperimentJarPercentages(); // [0, 1, 2, ..., 100]

  const handleJarsAnimationComplete = () => {
    setJarsAnimated(true);
    playJarClink();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-700">
            You will now begin the main task. In this task, you will observe balls being drawn from a randomly chosen jar.
          </p>

          <div className="space-y-4 text-gray-700">
            <p>
              You will see 101 jars on the screen. Each jar contains 100 balls that can be either black or white.
              The label below each jar indicates how many black balls are inside it.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg text-left max-w-2xl mx-auto space-y-2">
              <p><strong>For example:</strong></p>
              <p>A jar labeled <strong>30%</strong> contains 30 black balls and 70 white balls. Thus, the probability of black balls in the jar is 30% (30 black balls out of 100 total balls).</p>
              <p>Similarly, a jar labeled <strong>70%</strong> contains 70 black balls and 30 white balls. Thus, the probability of black balls in the jar is 70% (70 black balls out of 100 total balls).</p>
            </div>
          </div>

          {/* 101 Jar Grid */}
          <div className="my-8">
            <JarGrid
              percentages={mainJars}
              animateIn={true}
              onAnimationComplete={handleJarsAnimationComplete}
              size="sm"
              columns={11}
            />
          </div>

          <p className="text-gray-700">
            The label represents the <strong>probability of drawing a black ball</strong> from that jar.
          </p>

          <div className="mt-8">
            <Button onClick={() => router.push("/experiment/instructions")}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
