"use client";

import { useRouter } from "next/navigation";

export default function Phase1Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Phase 1: Red Jar</h1>
          <p className="text-gray-700">
            Red jar trials will be implemented here (40 trials)
          </p>

          {/* TODO: Implement Phase 1 - Red Jar trials */}

          <button
            onClick={() => router.push("/experiment/phase2")}
            className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Continue to Phase 2
          </button>
        </div>
      </div>
    </div>
  );
}
