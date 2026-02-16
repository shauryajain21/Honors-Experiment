"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function ExperimentInstructionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Main Study</h1>

          <div className="text-left space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900">What you will do</h2>
            <p className="text-gray-700">
              Press the spacebar to draw a ball. A ball will appear showing whether it is black or white.
            </p>
            <p className="text-gray-700">
              Using all the balls you have seen so far, you will:
            </p>
            <div className="pl-4 text-gray-700 space-y-1">
              <p>(a) Enter your estimate of the probability (0–100%) that the jar produces a black ball</p>
              <p>(b) Rate how confident you are in your estimate on a scale of 0 to 10</p>
            </div>
            <p className="text-gray-700">
              After each draw, the ball is returned to the jar. You will be able to see the sequence of balls you have drawn after every trial.
            </p>
          </div>

          <div className="mt-8">
            <Button onClick={() => router.push("/experiment/jar-selection")}>
              Begin Study
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
