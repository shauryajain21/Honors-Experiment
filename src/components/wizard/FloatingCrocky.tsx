"use client";

import { motion } from "framer-motion";
import { useCrocky } from "@/context/CrockyContext";
import WizardCharacter from "./WizardCharacter";

export default function FloatingCrocky() {
  const { isNarrationActive } = useCrocky();

  // When WizardNarration is active, it handles its own croc display
  if (isNarrationActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <WizardCharacter size="lg" variant="still" />
      </motion.div>
    </div>
  );
}
