import { useEffect, useState } from "react";

/**
 * Hook to detect when a specific key is pressed
 * @param targetKey - The key to detect (e.g., ' ' for spacebar, 'Enter', etc.)
 * @param callback - Optional callback function to execute when key is pressed
 * @param enabled - Whether the hook is active (default true)
 * @returns boolean indicating if the key is currently pressed
 */
export function useKeyPress(
  targetKey: string,
  callback?: () => void,
  enabled: boolean = true
): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        // Prevent default behavior (e.g., spacebar scrolling page)
        event.preventDefault();
        setKeyPressed(true);
        if (callback) {
          callback();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [targetKey, callback, enabled]);

  return keyPressed;
}

/**
 * Hook specifically for spacebar detection
 * @param callback - Function to execute when spacebar is pressed
 * @param enabled - Whether the hook is active (default true)
 */
export function useSpacebar(
  callback: () => void,
  enabled: boolean = true
): boolean {
  return useKeyPress(" ", callback, enabled);
}
