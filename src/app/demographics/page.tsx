"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DemographicsPage() {
  const [isNYUStudent, setIsNYUStudent] = useState<boolean | null>(null);
  const [year, setYear] = useState("");
  const [majors, setMajors] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Store demographics in Zustand
    router.push("/debrief");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            We're almost there!
          </h1>
          <p className="text-center text-gray-700">
            Before we end the study, please take a moment to answer the following questions
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-900">
                Are you an NYU student?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="nyu-student"
                    checked={isNYUStudent === true}
                    onChange={() => setIsNYUStudent(true)}
                    className="mr-2"
                    required
                  />
                  <span className="text-gray-900">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="nyu-student"
                    checked={isNYUStudent === false}
                    onChange={() => setIsNYUStudent(false)}
                    className="mr-2"
                    required
                  />
                  <span className="text-gray-900">No</span>
                </label>
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
              <label htmlFor="majors" className="block text-lg font-medium text-gray-900">
                List your major(s)/minor(s)
              </label>
              <input
                type="text"
                id="majors"
                value={majors}
                onChange={(e) => setMajors(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-nyu-purple text-gray-900"
                placeholder="e.g., Psychology, Computer Science"
                required
              />
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
