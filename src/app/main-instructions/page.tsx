"use client";

import { useRouter } from "next/navigation";

export default function MainInstructionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Main Experiment</h1>
          <p className="text-lg text-gray-700">
            You will now begin the main task. In this task, you will observe balls being drawn from a randomly chosen jar.
          </p>

          {/* TODO: Display 101 jars with animation */}

          <button
            onClick={() => router.push("/experiment/phase1")}
            className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Begin Main Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
