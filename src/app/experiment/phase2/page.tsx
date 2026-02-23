"use client";

import { useRouter } from "next/navigation";
import { useExperimentStore } from "@/store/experimentStore";
import TrialRunner from "@/components/experiment/TrialRunner";
import { PHASE_TRIAL_COUNT } from "@/lib/utils/constants";

export default function Phase2Page() {
  const router = useRouter();
  const greenJarPercentage = useExperimentStore((s) => s.greenJarPercentage);
  const redJarPercentage = useExperimentStore((s) => s.redJarPercentage);
  const addPhase2Trial = useExperimentStore((s) => s.addPhase2Trial);
  const saveToBackend = useExperimentStore((s) => s.saveToBackend);

  const handleAllComplete = () => {
    saveToBackend();
    router.push("/experiment/phase3-transition");
  };

  return (
    <TrialRunner
      jarColor="green"
      jarPercentage={greenJarPercentage}
      totalTrials={PHASE_TRIAL_COUNT}
      phaseNumber={2}
      onTrialComplete={addPhase2Trial}
      onAllTrialsComplete={handleAllComplete}
      sideJar={{ color: "red", percentage: redJarPercentage }}
    />
  );
}
