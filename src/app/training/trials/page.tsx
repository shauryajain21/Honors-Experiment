"use client";

import { useRouter } from "next/navigation";

export default function TrainingTrialsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Training Trials</h1>
          <p className="text-gray-700">
            Training trials will be implemented here (10 trials)
          </p>

          {/* TODO: Implement 10 training trials */}

          <button
            onClick={() => router.push("/main-instructions")}
            className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Continue to Main Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
