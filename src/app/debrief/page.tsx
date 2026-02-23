"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useExperimentStore } from "@/store/experimentStore";
import WizardNarration from "@/components/wizard/WizardNarration";
import WizardCharacter from "@/components/wizard/WizardCharacter";

const DEBRIEF_STEPS = [
  "Thank you for participating! Please read the debriefing information below and click 'End Study' when you are done.",
];

export default function DebriefPage() {
  const [ended, setEnded] = useState(false);
  const [saving, setSaving] = useState(false);
  const setEndTime = useExperimentStore((s) => s.setEndTime);
  const saveToBackend = useExperimentStore((s) => s.saveToBackend);

  const handleEndStudy = async () => {
    setEndTime();
    setSaving(true);
    await saveToBackend();
    setSaving(false);
    setEnded(true);
  };

  if (ended) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-2xl">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Party croc - bouncing animation */}
            <motion.div
              animate={{
                y: [0, -15, 0, -10, 0, -5, 0],
                rotate: [0, -5, 5, -3, 3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut",
              }}
            >
              <WizardCharacter size="xl" variant="talking" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                You did it! Great job!
              </h2>
              <p className="text-lg text-gray-600">
                Thanks for completing the experiment with Mr. Croc. You may now close this window.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WizardNarration steps={DEBRIEF_STEPS} />
      <div className="glass-card p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Thank You!
          </h1>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p>
              You have now reached the end of the experiment. Thank you for taking the time to participate in this study.
            </p>

            <p>
              The purpose of this experiment was to understand how people update beliefs when they receive new evidence and whether previously learned beliefs are stored and reused when a situation returns. During the task, you observed balls drawn from urns and repeatedly estimated the probability of drawing a black ball.
            </p>

            <p>
              The study was designed to examine how people form beliefs, adjust them when circumstances change, and whether they return to earlier beliefs when a familiar situation reappears. Some aspects of the task were not fully explained beforehand so that your responses would reflect natural judgment rather than following a specific strategy.
            </p>

            <p>
              In particular, the appearance of different urns allowed us to test whether people treat earlier knowledge as something that can be remembered and reinstated, rather than always starting from scratch. There were no correct answers on individual trials – we were interested only in how your estimates changed over time.
            </p>

            <p>
              Your responses will remain anonymous and will be used only for research purposes.
            </p>

            <p>
              If you have any questions about the study, you may contact the researcher (saanika.banga@nyu.edu) or supervising professor (ltm1@nyu.edu).
            </p>

            <p className="font-semibold">
              Thank you again for your time and participation. Your contribution helps us better understand how people reason and make decisions under uncertainty.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 mt-8">
            <button
              onClick={handleEndStudy}
              disabled={saving}
              className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Saving data..." : "End Study"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
