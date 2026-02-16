"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JarTransitionAnimation from "@/components/experiment/JarTransitionAnimation";
import Modal from "@/components/ui/Modal";
import { useExperimentStore } from "@/store/experimentStore";

export default function Phase2TransitionPage() {
  const router = useRouter();
  const redJarPercentage = useExperimentStore((s) => s.redJarPercentage);
  const greenJarPercentage = useExperimentStore((s) => s.greenJarPercentage);
  const [transitionDone, setTransitionDone] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleTransitionComplete = () => {
    setTransitionDone(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/experiment/phase2");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <JarTransitionAnimation
          exitingJar={{ color: "red", percentage: redJarPercentage }}
          enteringJar={{ color: "green", percentage: greenJarPercentage }}
          onComplete={handleTransitionComplete}
        />

        <Modal isOpen={showModal} onClose={handleCloseModal}>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              The red jar has now been kept to the side. A jar has been selected from the array of 101 jars shown before and has a green label attached to it. Similar to the previous trials, you will be asked to estimate the probability of black balls in this jar and your confidence in your estimates. Press the space bar to release a ball from the jar. Once you have read the instructions you can close this pop up by clicking on the cross in the corner.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}
