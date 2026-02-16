"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

type AnimationPhase = "showing-jars" | "jumbling" | "selecting" | "estimate";

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
  const [probability, setProbability] = useState(50);
  const [confidence, setConfidence] = useState(5);

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

    // After jumble duration, move to selecting
    setTimeout(() => {
      setPhase("selecting");
      // After a brief pause, show the estimate form
      setTimeout(() => {
        setPhase("estimate");
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
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Phase: showing jars / jumbling */}
          {(phase === "showing-jars" || phase === "jumbling") && (
            <div className="text-center">
              <div className="my-4">
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

          {/* Phase: selecting - show selected jar */}
          {phase === "selecting" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center space-y-4"
            >
              <JarDisplay
                percentage={redJarPercentage}
                size="lg"
                color="red"
                label="Red"
                showPercentage={false}
              />
              <p className="text-gray-500 text-sm">A jar has been selected...</p>
            </motion.div>
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
                <div className="flex justify-center mb-6">
                  <JarDisplay
                    percentage={redJarPercentage}
                    size="lg"
                    color="red"
                    label="Red"
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
