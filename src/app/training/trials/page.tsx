"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TrainingTrial from "@/components/experiment/TrainingTrial";
import Button from "@/components/ui/Button";
import WizardNarration from "@/components/wizard/WizardNarration";
import { useExperimentStore } from "@/store/experimentStore";
import { TRAINING_TRIAL_COUNT } from "@/lib/utils/constants";
import type { TrainingTrialData } from "@/store/experimentStore";

const TRAINING_TRIAL_STEPS = [
  "Look at the sample of balls shown above. Choose the jar that you think most likely produced this sample by clicking on it.",
];

export default function TrainingTrialsPage() {
  const router = useRouter();
  const addTrainingTrial = useExperimentStore((s) => s.addTrainingTrial);
  const [currentTrial, setCurrentTrial] = useState(1);
  const [allComplete, setAllComplete] = useState(false);

  const handleTrialComplete = (data: TrainingTrialData) => {
    addTrainingTrial(data);

    if (currentTrial >= TRAINING_TRIAL_COUNT) {
      setAllComplete(true);
    } else {
      setCurrentTrial((prev) => prev + 1);
    }
  };

  if (allComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Training Complete</h1>
            <p className="text-gray-700">
              You have completed all {TRAINING_TRIAL_COUNT} training trials. You are now ready for the main experiment.
            </p>
            <Button onClick={() => router.push("/main-instructions")}>
              Continue to Main Experiment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={TRAINING_TRIAL_STEPS} />
      <div className="glass-card p-8 w-full max-w-4xl">
        {/* Progress */}
        <div className="text-center text-sm text-gray-400 mb-4">
          Training Trial {currentTrial} of {TRAINING_TRIAL_COUNT}
        </div>

        <TrainingTrial
          key={currentTrial}
          trialNumber={currentTrial}
          onComplete={handleTrialComplete}
        />
      </div>
    </div>
  );
}
