"use client";

import { useRouter } from "next/navigation";

export default function Phase3Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Phase 3: Red Jar Return</h1>
          <p className="text-gray-700">
            Red jar return trials will be implemented here (40 trials)
          </p>

          {/* TODO: Implement Phase 3 - Red Jar return trials */}

          <button
            onClick={() => router.push("/demographics")}
            className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Continue to Demographics
          </button>
        </div>
      </div>
    </div>
  );
}
