"use client";

import { useRouter } from "next/navigation";
import { useExperimentStore } from "@/store/experimentStore";
import TrialRunner from "@/components/experiment/TrialRunner";
import { PHASE_TRIAL_COUNT } from "@/lib/utils/constants";

export default function Phase1Page() {
  const router = useRouter();
  const redJarPercentage = useExperimentStore((s) => s.redJarPercentage);
  const addPhase1Trial = useExperimentStore((s) => s.addPhase1Trial);

  return (
    <TrialRunner
      jarColor="red"
      jarPercentage={redJarPercentage}
      totalTrials={PHASE_TRIAL_COUNT}
      onTrialComplete={addPhase1Trial}
      onAllTrialsComplete={() => router.push("/experiment/phase2-transition")}
    />
  );
}
