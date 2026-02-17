"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JarGrid from "@/components/jars/JarGrid";
import { getMainExperimentJarPercentages } from "@/lib/experiment/jarProbabilities";
import { useAudio } from "@/hooks/useAudio";
import Button from "@/components/ui/Button";
import WizardNarration from "@/components/wizard/WizardNarration";

const INSTRUCTION_STEPS = [
  "You will now begin the main task. In this task, you will observe balls being drawn from a randomly chosen jar.",
  "You will see 101 jars on the screen. Each jar contains 100 balls that can be either black or white. The label below each jar indicates how many black balls are inside it.",
  "For example: A jar labeled 30% contains 30 black balls and 70 white balls, giving a 30% probability. Similarly, a jar labeled 70% has 70 black balls and 30 white balls.",
  "The label represents the probability of drawing a black ball from that jar.",
];

export default function MainInstructionsPage() {
  const router = useRouter();
  const { playJarClink } = useAudio();
  const [jarsAnimated, setJarsAnimated] = useState(false);

  const mainJars = getMainExperimentJarPercentages();

  const handleJarsAnimationComplete = () => {
    setJarsAnimated(true);
    playJarClink();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="space-y-6">
          <WizardNarration steps={INSTRUCTION_STEPS} />

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

          <div className="text-center mt-8">
            <Button onClick={() => router.push("/experiment/instructions")}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
