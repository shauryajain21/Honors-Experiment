import { Howl } from "howler";
import {
  AUDIO_VOLUME_JAR_CLINK,
  AUDIO_VOLUME_BALL_BOUNCE,
  AUDIO_VOLUME_JAR_SHAKE,
} from "@/lib/utils/constants";

type SoundName = "jarClink" | "ballBounce" | "jarShake";

class AudioManager {
  private sounds: Map<SoundName, Howl>;
  private muted: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.sounds = new Map();
  }

  /**
   * Initialize all sounds
   * Call this after user interaction to avoid autoplay restrictions
   */
  initialize(): void {
    if (this.initialized) return;

    try {
      // Jar clink sound (when jars appear)
      this.sounds.set(
        "jarClink",
        new Howl({
          src: ["/sounds/jar-clink.mp3"],
          volume: AUDIO_VOLUME_JAR_CLINK,
          preload: true,
        })
      );

      // Ball bounce sound (when ball is drawn)
      this.sounds.set(
        "ballBounce",
        new Howl({
          src: ["/sounds/ball-bounce.mp3"],
          volume: AUDIO_VOLUME_BALL_BOUNCE,
          preload: true,
        })
      );

      // Jar shake sound (before drawing ball)
      this.sounds.set(
        "jarShake",
        new Howl({
          src: ["/sounds/jar-shake.mp3"],
          volume: AUDIO_VOLUME_JAR_SHAKE,
          preload: true,
        })
      );

      this.initialized = true;
      console.log("AudioManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AudioManager:", error);
    }
  }

  /**
   * Play a sound by name
   * @param soundName - Name of the sound to play
   */
  play(soundName: SoundName): void {
    if (!this.initialized) {
      console.warn("AudioManager not initialized. Call initialize() first.");
      return;
    }

    if (this.muted) {
      return;
    }

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    } else {
      console.warn(`Sound "${soundName}" not found`);
    }
  }

  /**
   * Stop a currently playing sound
   * @param soundName - Name of the sound to stop
   */
  stop(soundName: SoundName): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.stop();
    }
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    this.sounds.forEach((sound) => sound.stop());
  }

  /**
   * Set volume for a specific sound
   * @param soundName - Name of the sound
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(soundName: SoundName, volume: number): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume(Math.max(0, Math.min(1, volume)));
    }
  }

  /**
   * Set master volume for all sounds
   * @param volume - Volume level (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => sound.volume(clampedVolume));
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    this.muted = true;
    this.sounds.forEach((sound) => sound.mute(true));
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    this.muted = false;
    this.sounds.forEach((sound) => sound.mute(false));
  }

  /**
   * Toggle mute status
   */
  toggleMute(): void {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Check if audio is muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Check if audio is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Cleanup all sounds
   */
  destroy(): void {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
    this.initialized = false;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
