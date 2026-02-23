"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JarDisplay from "@/components/jars/JarDisplay";
import Ball from "@/components/balls/Ball";
import BallSequence from "@/components/balls/BallSequence";
import ProbabilityButtons from "@/components/inputs/ProbabilityButtons";
import ConfidenceSlider from "@/components/inputs/ConfidenceSlider";
import Button from "@/components/ui/Button";
import WizardNarration from "@/components/wizard/WizardNarration";
import { useAudio } from "@/hooks/useAudio";
import { drawBall } from "@/lib/experiment/ballDrawing";
import { fadeInVariants } from "@/lib/utils/animations";
import { PHASE_TRIAL_COUNT } from "@/lib/utils/constants";
import type { BallColor, TrialData, JarColor } from "@/store/experimentStore";

const TRIAL_STEPS = [
  "Observe the ball drawn from the jar. Then estimate the probability of black balls and rate your confidence.",
];

type TrialState =
  | "DRAWING"
  | "ESTIMATING"
  | "CONFIDENCE"
  | "READY_NEXT";

interface TrialRunnerProps {
  jarColor: "red" | "green";
  jarPercentage: number;
  totalTrials: number;
  phaseNumber: 1 | 2 | 3;
  onTrialComplete: (data: TrialData) => void;
  onAllTrialsComplete: () => void;
  sideJar?: { color: "red" | "green"; percentage: number } | null;
}

export default function TrialRunner({
  jarColor,
  jarPercentage,
  totalTrials,
  phaseNumber,
  onTrialComplete,
  onAllTrialsComplete,
  sideJar = null,
}: TrialRunnerProps) {
  const [trialState, setTrialState] = useState<TrialState>("DRAWING");
  const [currentTrial, setCurrentTrial] = useState(1);
  const [ballSequence, setBallSequence] = useState<BallColor[]>([]);
  const [currentBall, setCurrentBall] = useState<BallColor | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [probability, setProbability] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [confidenceInteracted, setConfidenceInteracted] = useState(false);
  const estimateStartRef = useRef<number>(0);

  const { playJarShake, playBallBounce } = useAudio();

  // Auto-draw ball when entering DRAWING state
  useEffect(() => {
    if (trialState === "DRAWING" && !isShaking && !currentBall) {
      setIsShaking(true);
      playJarShake();
    }
  }, [trialState, isShaking, currentBall, playJarShake]);

  // After jar shake completes, draw and show ball
  const handleShakeComplete = useCallback(() => {
    setIsShaking(false);
    const ball = drawBall(jarPercentage);
    setCurrentBall(ball);
    playBallBounce();
  }, [jarPercentage, playBallBounce]);

  // After ball bounce animation completes, move to estimating
  const handleBallAnimationComplete = useCallback(() => {
    if (currentBall) {
      setBallSequence((prev) => [...prev, currentBall]);
      setTrialState("ESTIMATING");
      estimateStartRef.current = Date.now();
    }
  }, [currentBall]);

  // Handle probability selection → show confidence
  const handleProbabilitySelect = (value: number) => {
    setProbability(value);
    setTrialState("CONFIDENCE");
  };

  // Handle confidence change
  const handleConfidenceChange = (value: number) => {
    setConfidence(value);
    setConfidenceInteracted(true);
  };

  // Handle confidence submit
  const handleConfidenceSubmit = () => {
    if (!confidenceInteracted) return;
    setTrialState("READY_NEXT");
  };

  // Handle Next → record data and auto-draw next ball
  const handleNext = () => {
    const reactionTime = Date.now() - estimateStartRef.current;

    const trialData: TrialData = {
      trialNumber: currentTrial,
      timestamp: new Date().toISOString(),
      jarType: jarColor as JarColor,
      jarPercentage,
      drawnBall: currentBall!,
      ballSequence: [...ballSequence],
      estimatedProbability: probability!,
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
      setProbability(null);
      setConfidence(0);
      setConfidenceInteracted(false);
      setTrialState("DRAWING");
    }
  };

  // Calculate global trial number (across all 99 trials)
  const globalTrialNumber =
    (phaseNumber - 1) * PHASE_TRIAL_COUNT + currentTrial;
  const totalGlobalTrials = PHASE_TRIAL_COUNT * 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={TRIAL_STEPS} />
      <div className="w-full max-w-4xl">
        <div className="glass-card p-8">
          <div className="space-y-6">
            {/* Global trial countdown */}
            <div className="text-center text-sm text-gray-400">
              Trial {globalTrialNumber} of {totalGlobalTrials}
            </div>

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

                  {/* Current ball animation (during drawing) */}
                  <AnimatePresence>
                    {currentBall && trialState === "DRAWING" && (
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
                  {currentBall && trialState !== "DRAWING" && (
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

            {/* Drawing state */}
            {trialState === "DRAWING" && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="text-center"
              >
                <p className="text-lg text-gray-600">
                  Drawing a ball from the jar...
                </p>
              </motion.div>
            )}

            {/* Estimating state - probability buttons */}
            {trialState === "ESTIMATING" && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <ProbabilityButtons
                  value={probability}
                  onChange={handleProbabilitySelect}
                />
              </motion.div>
            )}

            {/* Confidence state - slider */}
            {trialState === "CONFIDENCE" && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="text-center">
                  <span className="inline-block bg-nyu-purple text-white px-4 py-2 rounded-lg font-bold text-lg">
                    Your estimate: {probability}%
                  </span>
                </div>

                <ConfidenceSlider
                  value={confidence}
                  onChange={handleConfidenceChange}
                />

                <div className="text-center">
                  <Button
                    onClick={handleConfidenceSubmit}
                    disabled={!confidenceInteracted}
                  >
                    Submit
                  </Button>
                  {!confidenceInteracted && (
                    <p className="text-sm text-red-500 mt-2">
                      Please adjust the confidence slider before submitting
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Ready for next - show summary and Next button */}
            {trialState === "READY_NEXT" && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    Estimate: <span className="font-bold">{probability}%</span> | Confidence: <span className="font-bold">{confidence}/10</span>
                  </p>
                </div>

                <div className="text-center">
                  <Button onClick={handleNext}>
                    {currentTrial >= totalTrials ? "Finish" : "Next"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
