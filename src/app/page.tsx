"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [sonaId, setSonaId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sonaId.length >= 4) {
      // TODO: Store SONA ID in Zustand store
      router.push("/consent");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome!
          </h1>
          <p className="text-lg text-gray-700">
            Thank you for participating in this research study.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label htmlFor="sonaId" className="block text-lg font-medium text-gray-900">
                Please enter your SONA ID
              </label>
              <p className="text-sm text-gray-600">
                Your SONA ID is the identifier used to assign participation credit that you received in your email when you registered to participate in this study
              </p>
              <input
                type="text"
                id="sonaId"
                value={sonaId}
                onChange={(e) => setSonaId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-nyu-purple text-gray-900"
                placeholder="Enter your SONA ID"
                required
                minLength={4}
              />
            </div>

            <button
              type="submit"
              disabled={sonaId.length < 4}
              className="w-full bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
