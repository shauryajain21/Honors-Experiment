"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExperimentStore } from "@/store/experimentStore";
import type { DemographicsData } from "@/store/experimentStore";
import WizardNarration from "@/components/wizard/WizardNarration";

const DEMOGRAPHICS_STEPS = [
  "You're almost done! Please answer a few quick questions about yourself.",
];

export default function DemographicsPage() {
  const [gender, setGender] = useState<DemographicsData["gender"] | "">("");
  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  const router = useRouter();
  const setDemographics = useExperimentStore((s) => s.setDemographics);
  const saveToBackend = useExperimentStore((s) => s.saveToBackend);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) return;
    setDemographics({
      gender,
      academicYear: year,
      major,
      minor,
    });
    saveToBackend();
    router.push("/debrief");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={DEMOGRAPHICS_STEPS} />
      <div className="glass-card p-8 w-full max-w-2xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            We&apos;re almost there!
          </h1>
          <p className="text-center text-gray-700">
            Before we end the study, please take a moment to answer the following questions
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-900">
                What is your gender?
              </label>
              <div className="flex flex-wrap gap-4">
                {([
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "non-binary", label: "Non-Binary" },
                  { value: "prefer-not-to-share", label: "Prefer not to share" },
                ] as const).map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === option.value}
                      onChange={() => setGender(option.value)}
                      className="mr-2"
                      required
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="year" className="block text-lg font-medium text-gray-900">
                What year are you in of your college degree?
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-nyu-purple text-gray-900"
                required
              >
                <option value="">Select...</option>
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="masters">Masters</option>
                <option value="phd">PhD</option>
                <option value="other">Some other degree</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-900">
                List your majors/minors
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-nyu-purple text-gray-900"
                  placeholder="Major e.g. Psychology"
                />
                <input
                  type="text"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-nyu-purple text-gray-900"
                  placeholder="Minor e.g. Computer Science"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
