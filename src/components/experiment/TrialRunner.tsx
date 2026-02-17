"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JarDisplay from "@/components/jars/JarDisplay";
import Ball from "@/components/balls/Ball";
import BallSequence from "@/components/balls/BallSequence";
import ProbabilitySlider from "@/components/inputs/ProbabilitySlider";
import ConfidenceSlider from "@/components/inputs/ConfidenceSlider";
import Button from "@/components/ui/Button";
import WizardNarration from "@/components/wizard/WizardNarration";
import { useSpacebar } from "@/hooks/useKeyPress";
import { useAudio } from "@/hooks/useAudio";
import { drawBall } from "@/lib/experiment/ballDrawing";
import { fadeInVariants } from "@/lib/utils/animations";
import type { BallColor, TrialData, JarColor } from "@/store/experimentStore";

const TRIAL_STEPS = [
  "Press the spacebar to draw a ball from the jar. After seeing the ball, estimate the probability of black balls and rate your confidence.",
];

type TrialState = "WAITING_FOR_SPACEBAR" | "ANIMATING" | "ESTIMATING";

interface TrialRunnerProps {
  jarColor: "red" | "green";
  jarPercentage: number;
  totalTrials: number;
  onTrialComplete: (data: TrialData) => void;
  onAllTrialsComplete: () => void;
  sideJar?: { color: "red" | "green"; percentage: number } | null;
}

export default function TrialRunner({
  jarColor,
  jarPercentage,
  totalTrials,
  onTrialComplete,
  onAllTrialsComplete,
  sideJar = null,
}: TrialRunnerProps) {
  const [trialState, setTrialState] = useState<TrialState>("WAITING_FOR_SPACEBAR");
  const [currentTrial, setCurrentTrial] = useState(1);
  const [ballSequence, setBallSequence] = useState<BallColor[]>([]);
  const [currentBall, setCurrentBall] = useState<BallColor | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [probability, setProbability] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const estimateStartRef = useRef<number>(0);

  const { playJarShake, playBallBounce } = useAudio();

  // Handle spacebar press to draw a ball
  const handleSpacebar = useCallback(() => {
    if (trialState !== "WAITING_FOR_SPACEBAR") return;
    setTrialState("ANIMATING");
    setIsShaking(true);
    playJarShake();
  }, [trialState, playJarShake]);

  useSpacebar(handleSpacebar, trialState === "WAITING_FOR_SPACEBAR");

  // After jar shake completes, draw and show ball
  const handleShakeComplete = useCallback(() => {
    setIsShaking(false);
    const ball = drawBall(jarPercentage);
    setCurrentBall(ball);
    playBallBounce();
  }, [jarPercentage, playBallBounce]);

  // After ball bounce animation completes, show sliders
  const handleBallAnimationComplete = useCallback(() => {
    if (currentBall) {
      setBallSequence((prev) => [...prev, currentBall]);
      setTrialState("ESTIMATING");
      estimateStartRef.current = Date.now();
    }
  }, [currentBall]);

  // Handle submit estimate
  const handleSubmit = () => {
    const reactionTime = Date.now() - estimateStartRef.current;

    const trialData: TrialData = {
      trialNumber: currentTrial,
      timestamp: new Date().toISOString(),
      jarType: jarColor as JarColor,
      jarPercentage,
      drawnBall: currentBall!,
      ballSequence: [...ballSequence],
      estimatedProbability: probability,
      confidence,
      reactionTime,
    };

    onTrialComplete(trialData);

    if (currentTrial >= totalTrials) {
      onAllTrialsComplete();
    } else {
      // Reset for next trial
      setCurrentTrial((prev) => prev + 1);
      setCurrentBall(null);
      setProbability(0);
      setConfidence(0);
      setTrialState("WAITING_FOR_SPACEBAR");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={TRIAL_STEPS} />
      <div className="w-full max-w-4xl">
        <div className="glass-card p-8">
          <div className="space-y-6">
            {/* Jar display area */}
            <div className="jar-stage">
              <div className="flex justify-center items-start gap-8">
                {/* Side jar (if in phase 2 or 3) */}
                {sideJar && (
                  <div className="opacity-50 scale-75">
                    <JarDisplay
                      percentage={sideJar.percentage}
                      size="md"
                      color={sideJar.color}
                      showPercentage={false}
                    />
                  </div>
                )}

                {/* Main active jar */}
                <div className="flex flex-col items-center">
                  <JarDisplay
                    percentage={jarPercentage}
                    size="lg"
                    color={jarColor}
                    animate={isShaking}
                    onAnimationComplete={handleShakeComplete}
                    showPercentage={false}
                  />

                  {/* Current ball animation */}
                  <AnimatePresence>
                    {currentBall && trialState === "ANIMATING" && (
                      <div className="mt-4">
                        <Ball
                          color={currentBall}
                          size={50}
                          animate={true}
                          onAnimationComplete={handleBallAnimationComplete}
                        />
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Show current ball after animation (static) */}
                  {currentBall && trialState === "ESTIMATING" && (
                    <div className="mt-4">
                      <Ball color={currentBall} size={50} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ball sequence */}
            {ballSequence.length > 0 && (
              <BallSequence balls={ballSequence} size={24} />
            )}

            {/* Waiting state */}
            {trialState === "WAITING_FOR_SPACEBAR" && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="text-center"
              >
                <p className="text-lg text-gray-600">
                  Press the space bar to release the next ball
                </p>
              </motion.div>
            )}

            {/* Estimating state - sliders */}
            {trialState === "ESTIMATING" && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <p className="text-lg text-gray-700 text-center font-medium">
                  What is your estimate about the probability of black balls in this jar?
                </p>

                <ProbabilitySlider
                  value={probability}
                  onChange={setProbability}
                  label=""
                />

                <ConfidenceSlider
                  value={confidence}
                  onChange={setConfidence}
                />

                <div className="text-center">
                  <Button onClick={handleSubmit}>Next</Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
