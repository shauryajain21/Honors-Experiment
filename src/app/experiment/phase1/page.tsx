"use client";

import { useRouter } from "next/navigation";
import { useExperimentStore } from "@/store/experimentStore";
import TrialRunner from "@/components/experiment/TrialRunner";
import { PHASE_TRIAL_COUNT } from "@/lib/utils/constants";

export default function Phase1Page() {
  const router = useRouter();
  const redJarPercentage = useExperimentStore((s) => s.redJarPercentage);
  const addPhase1Trial = useExperimentStore((s) => s.addPhase1Trial);
  const saveToBackend = useExperimentStore((s) => s.saveToBackend);

  const handleAllComplete = () => {
    saveToBackend();
    router.push("/experiment/phase2-transition");
  };

  return (
    <TrialRunner
      jarColor="red"
      jarPercentage={redJarPercentage}
      totalTrials={PHASE_TRIAL_COUNT}
      phaseNumber={1}
      onTrialComplete={addPhase1Trial}
      onAllTrialsComplete={handleAllComplete}
    />
  );
}
