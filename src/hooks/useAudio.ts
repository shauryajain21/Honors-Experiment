import { useEffect, useState } from "react";
import { audioManager } from "@/lib/audio/AudioManager";

/**
 * Hook for managing audio in components
 * Automatically initializes audio manager on mount
 * @returns Object with audio control methods
 */
export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Initialize audio manager on first render
    // This happens after user has interacted with the page
    if (!audioManager.isInitialized()) {
      audioManager.initialize();
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }

    setIsMuted(audioManager.isMuted());
  }, []);

  const playJarClink = () => audioManager.play("jarClink");
  const playBallBounce = () => audioManager.play("ballBounce");
  const playJarShake = () => audioManager.play("jarShake");

  const toggleMute = () => {
    audioManager.toggleMute();
    setIsMuted(audioManager.isMuted());
  };

  const mute = () => {
    audioManager.mute();
    setIsMuted(true);
  };

  const unmute = () => {
    audioManager.unmute();
    setIsMuted(false);
  };

  return {
    isInitialized,
    isMuted,
    playJarClink,
    playBallBounce,
    playJarShake,
    toggleMute,
    mute,
    unmute,
  };
}
