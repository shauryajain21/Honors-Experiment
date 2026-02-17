"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import WizardNarration from "@/components/wizard/WizardNarration";

const EXPERIMENT_STEPS = [
  "Press the spacebar to draw a ball. A ball will appear showing whether it is black or white.",
  "Using all the balls you have seen so far, you will: (a) Enter your estimate of the probability (0–100%) that the jar produces a black ball, and (b) Rate how confident you are in your estimate on a scale of 0 to 10.",
  "After each draw, the ball is returned to the jar. You will be able to see the sequence of balls you have drawn after every trial.",
];

export default function ExperimentInstructionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-4xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Main Study</h1>

          <WizardNarration steps={EXPERIMENT_STEPS} />

          <div className="text-center mt-8">
            <Button onClick={() => router.push("/experiment/jar-selection")}>
              Begin Study
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
