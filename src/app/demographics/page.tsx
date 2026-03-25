"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExperimentStore } from "@/store/experimentStore";
import WizardNarration from "@/components/wizard/WizardNarration";

const DEMOGRAPHICS_STEPS = [
  "You're almost done! Please type your response to the question above.",
];

export default function DemographicsPage() {
  const [strategy, setStrategy] = useState("");
  const router = useRouter();
  const setDemographics = useExperimentStore((s) => s.setDemographics);
  const saveToBackend = useExperimentStore((s) => s.saveToBackend);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategy.trim()) return;
    setDemographics({
      gender: "prefer-not-to-share",
      academicYear: "",
      major: "",
      minor: "",
      strategy,
    });
    await saveToBackend();
    router.push("/debrief");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={DEMOGRAPHICS_STEPS} />
      <div className="glass-card p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            We&apos;re almost there!
          </h1>
          <p className="text-center text-gray-700">
            Before we end the study, please take a moment to answer the question below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* Strategy question */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-900">
                What strategy did you use to decide the probability of black balls in the jar?
              </label>
              <p className="text-sm text-gray-600">
                Please describe in a few sentences how you made your probability estimates throughout the experiment.
              </p>
              <textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-nyu-purple text-gray-900 min-h-[120px] resize-y"
                placeholder="Describe your strategy..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={!strategy.trim()}
              className="w-full bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
