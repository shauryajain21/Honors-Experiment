"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import WizardNarration from "@/components/wizard/WizardNarration";

const JAR_SELECTION_STEPS = [
  "A jar is being randomly selected from the 101 jars. You will then estimate the probability of drawing a black ball from this jar.",
];
import JarDisplay from "@/components/jars/JarDisplay";
import JarGrid from "@/components/jars/JarGrid";
import ProbabilitySlider from "@/components/inputs/ProbabilitySlider";
import ConfidenceSlider from "@/components/inputs/ConfidenceSlider";
import Button from "@/components/ui/Button";
import { useExperimentStore } from "@/store/experimentStore";
import { getMainExperimentJarPercentages } from "@/lib/experiment/jarProbabilities";
import { useAudio } from "@/hooks/useAudio";
import { jarJumbleVariants, fadeInVariants } from "@/lib/utils/animations";
import { JAR_JUMBLE_DURATION } from "@/lib/utils/constants";

type AnimationPhase = "showing-jars" | "jumbling" | "selecting" | "marking" | "estimate";

export default function JarSelectionPage() {
  const router = useRouter();
  const {
    redJarPercentage,
    initializeJars,
    setRedJarEstimate,
    setStartTime,
  } = useExperimentStore();

  const { playJarShake } = useAudio();
  const [phase, setPhase] = useState<AnimationPhase>("showing-jars");
  const [probability, setProbability] = useState(0);
  const [confidence, setConfidence] = useState(0);

  const mainJars = getMainExperimentJarPercentages();

  // Initialize jars and start experiment timing
  useEffect(() => {
    initializeJars();
    setStartTime();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start jumbling after showing jars
  const handleStartJumble = useCallback(() => {
    setPhase("jumbling");
    playJarShake();

    // After jumble duration, show white/neutral jar first
    setTimeout(() => {
      setPhase("selecting");
      // After a pause, animate the jar turning red (marking)
      setTimeout(() => {
        setPhase("marking");
        // After the marking animation, show estimate form
        setTimeout(() => {
          setPhase("estimate");
        }, 2000);
      }, 1500);
    }, JAR_JUMBLE_DURATION);
  }, [playJarShake]);

  // Auto-start jumble after a short delay
  useEffect(() => {
    if (phase === "showing-jars") {
      const timer = setTimeout(handleStartJumble, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, handleStartJumble]);

  const handleSubmit = () => {
    setRedJarEstimate({
      probability,
      confidence,
      timestamp: new Date().toISOString(),
    });
    router.push("/experiment/phase1");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={JAR_SELECTION_STEPS} />
      <div className="glass-card p-8 w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Phase: showing jars / jumbling */}
          {(phase === "showing-jars" || phase === "jumbling") && (
            <div className="text-center">
              <div className="my-4 jar-stage">
                <div
                  className="grid gap-2 justify-items-center"
                  style={{ gridTemplateColumns: "repeat(11, minmax(0, 1fr))" }}
                >
                  {mainJars.map((percentage, index) => (
                    <motion.div
                      key={`jar-${index}`}
                      variants={phase === "jumbling" ? jarJumbleVariants : undefined}
                      initial={phase === "jumbling" ? "initial" : undefined}
                      animate={phase === "jumbling" ? "jumble" : undefined}
                      custom={index}
                    >
                      <JarDisplay
                        percentage={percentage}
                        size="sm"
                        color="neutral"
                        showPercentage={false}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Phase: selecting - show selected jar as white/neutral first */}
          {phase === "selecting" && (
            <div className="jar-stage">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center space-y-4"
              >
                <JarDisplay
                  percentage={redJarPercentage}
                  size="lg"
                  color="neutral"
                  showPercentage={false}
                />
                <p className="text-gray-500 text-sm">A jar has been selected...</p>
              </motion.div>
            </div>
          )}

          {/* Phase: marking - animate jar turning red */}
          {phase === "marking" && (
            <div className="jar-stage">
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <JarDisplay
                    percentage={redJarPercentage}
                    size="lg"
                    color="red"
                    showPercentage={false}
                  />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 text-sm"
                >
                  This jar has been marked for the experiment.
                </motion.p>
              </div>
            </div>
          )}

          {/* Phase: estimate */}
          <AnimatePresence>
            {phase === "estimate" && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="jar-stage flex justify-center mb-6">
                  <JarDisplay
                    percentage={redJarPercentage}
                    size="lg"
                    color="red"
                    showPercentage={false}
                  />
                </div>

                <p className="text-lg text-gray-700 text-center font-medium">
                  Without drawing a ball, what is your initial estimate of the probability of black balls in this jar?
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
