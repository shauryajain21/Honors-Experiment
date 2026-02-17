"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SpeechBubbleProps {
  children: React.ReactNode;
  visible: boolean;
}

export default function SpeechBubble({ children, visible }: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative max-w-md w-full"
        >
          {/* Solid white rounded rectangle speech bubble */}
          <div className="relative bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
            {children}
          </div>

          {/* Speech tail pointing to the right (toward croc) */}
          <div
            className="absolute -right-3 bottom-6"
            style={{
              width: 0,
              height: 0,
              borderLeft: "16px solid white",
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              filter: "drop-shadow(2px 0 2px rgba(0,0,0,0.05))",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
