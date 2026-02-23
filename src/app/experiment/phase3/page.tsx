"use client";

import { useRouter } from "next/navigation";
import { useExperimentStore } from "@/store/experimentStore";
import TrialRunner from "@/components/experiment/TrialRunner";
import { PHASE_TRIAL_COUNT } from "@/lib/utils/constants";

export default function Phase3Page() {
  const router = useRouter();
  const redJarPercentage = useExperimentStore((s) => s.redJarPercentage);
  const greenJarPercentage = useExperimentStore((s) => s.greenJarPercentage);
  const addPhase3Trial = useExperimentStore((s) => s.addPhase3Trial);
  const saveToBackend = useExperimentStore((s) => s.saveToBackend);

  const handleAllComplete = () => {
    saveToBackend();
    router.push("/demographics");
  };

  return (
    <TrialRunner
      jarColor="red"
      jarPercentage={redJarPercentage}
      totalTrials={PHASE_TRIAL_COUNT}
      phaseNumber={3}
      onTrialComplete={addPhase3Trial}
      onAllTrialsComplete={handleAllComplete}
      sideJar={{ color: "green", percentage: greenJarPercentage }}
    />
  );
}
