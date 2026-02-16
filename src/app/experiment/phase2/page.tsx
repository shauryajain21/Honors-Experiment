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

  return (
    <TrialRunner
      jarColor="green"
      jarPercentage={greenJarPercentage}
      totalTrials={PHASE_TRIAL_COUNT}
      onTrialComplete={addPhase2Trial}
      onAllTrialsComplete={() => router.push("/experiment/phase3-transition")}
      sideJar={{ color: "red", percentage: redJarPercentage }}
    />
  );
}
