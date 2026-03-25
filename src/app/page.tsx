"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import WizardNarration from "@/components/wizard/WizardNarration";
import { useExperimentStore } from "@/store/experimentStore";

function generateCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const LANDING_STEPS = [
  "Hey there! I'm Mr. Croc, your guide for today's experiment. I'll be here to walk you through each step — let's get started!",
  "Please note down your participant code shown below before continuing.",
];

export default function LandingPage() {
  const code = useMemo(() => generateCode(), []);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const storeSonaId = useExperimentStore((s) => s.setSonaId);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeSonaId(code);
    router.push("/training/instructions");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={LANDING_STEPS} />
      <div className="glass-card p-8 w-full max-w-2xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome!
          </h1>
          <p className="text-lg text-gray-700">
            Thank you for participating in this research study.
          </p>

          <div className="bg-gray-50 border-2 border-nyu-purple rounded-lg p-6 space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Your participant code is:
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold tracking-widest text-nyu-purple font-mono">
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Please write this down or copy it. You may need it for reference.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              className="w-full bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
