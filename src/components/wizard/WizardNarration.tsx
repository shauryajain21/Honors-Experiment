"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WizardCharacter from "./WizardCharacter";
import SpeechBubble from "./SpeechBubble";
import { useCrocky } from "@/context/CrockyContext";

interface WizardNarrationProps {
  steps: string[];
  onComplete?: () => void;
}

export default function WizardNarration({
  steps,
  onComplete,
}: WizardNarrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isNarrating, setIsNarrating] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const { setNarrationActive } = useCrocky();

  // Tell the global FloatingCrocky to hide while this component is mounted
  useEffect(() => {
    setNarrationActive(true);
    return () => setNarrationActive(false);
  }, [setNarrationActive]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsNarrating(false);
      setIsCollapsed(true);
      onComplete?.();
    }
  }, [currentStep, steps.length, onComplete]);

  const handleOpenReference = () => {
    setShowReference(true);
  };

  const handleCloseReference = () => {
    setShowReference(false);
  };

  // Collapsed floating croc — bottom-right, large size
  if (isCollapsed && !showReference) {
    return (
      <div className="fixed bottom-4 right-4 z-30">
        <motion.button
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={handleOpenReference}
          className="relative rounded-2xl p-1 cursor-pointer group hover:scale-105 transition-transform"
          title="Review instructions"
        >
          <WizardCharacter size="lg" variant="still" />
          <span className="absolute -top-1 -left-1 bg-nyu-purple text-white text-sm w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white animate-bounce">
            ?
          </span>
        </motion.button>
      </div>
    );
  }

  // Reference panel — croc bottom-right with panel to its left
  if (showReference) {
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/10 z-40"
          onClick={handleCloseReference}
        />

        {/* Croc + reference panel */}
        <div className="fixed bottom-0 right-0 z-50 p-4 pointer-events-none">
          <div className="flex items-end gap-3">
            {/* Reference panel floating to the left of the croc */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden max-w-md w-full pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Instructions</span>
                <button
                  onClick={handleCloseReference}
                  className="ml-auto text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
              {/* All steps */}
              <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex-shrink-0 bg-nyu-purple text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Croc */}
            <div className="pointer-events-auto flex-shrink-0">
              <WizardCharacter size="lg" variant="still" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Active narration — croc in bottom-right, speech oval to its left
  return (
    <AnimatePresence>
      {isNarrating && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/10 z-40"
          />

          {/* Croc + speech bubble layout — bottom-right anchored */}
          <div className="fixed bottom-0 right-0 z-50 pointer-events-none">
            <div className="flex items-end gap-0 p-4">
              {/* Speech oval — positioned to the left of the croc */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
                className="pointer-events-auto mb-20 -mr-4"
              >
                <SpeechBubble visible={true}>
                  <div className="space-y-3">
                    {/* Step indicator with dots */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>
                        {currentStep + 1} / {steps.length}
                      </span>
                      <div className="flex gap-1">
                        {steps.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              i <= currentStep ? "bg-nyu-purple" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Step content */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentStep}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-700 leading-relaxed"
                      >
                        {steps[currentStep]}
                      </motion.p>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleNext}
                        className="bg-nyu-purple hover:bg-nyu-violet text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors cursor-pointer shadow-md hover:shadow-lg"
                      >
                        {currentStep < steps.length - 1 ? "Next" : "Got it!"}
                      </button>
                    </div>
                  </div>
                </SpeechBubble>
              </motion.div>

              {/* Croc character — big, bottom-right */}
              <motion.div
                initial={{ scale: 0.6, y: 60 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.6, y: 60 }}
                transition={{ type: "spring", stiffness: 180, damping: 16 }}
                className="flex-shrink-0 pointer-events-auto drop-shadow-2xl"
              >
                <WizardCharacter size="xl" variant="talking" />
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
