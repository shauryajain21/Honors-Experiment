import {
  AUDIO_VOLUME_JAR_CLINK,
  AUDIO_VOLUME_BALL_BOUNCE,
  AUDIO_VOLUME_JAR_SHAKE,
} from "@/lib/utils/constants";

type SoundName = "jarClink" | "ballBounce" | "jarShake";

class AudioManager {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;
  private initialized: boolean = false;
  private volumes: Record<SoundName, number> = {
    jarClink: AUDIO_VOLUME_JAR_CLINK,
    ballBounce: AUDIO_VOLUME_BALL_BOUNCE,
    jarShake: AUDIO_VOLUME_JAR_SHAKE,
  };

  constructor() {}

  /**
   * Initialize audio context
   * Call this after user interaction to avoid autoplay restrictions
   */
  initialize(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
      console.log("AudioManager initialized successfully (Web Audio API)");
    } catch (error) {
      console.error("Failed to initialize AudioManager:", error);
    }
  }

  private getContext(): AudioContext | null {
    if (!this.audioContext) return null;
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Play a sound by name
   */
  play(soundName: SoundName): void {
    if (!this.initialized || this.muted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    switch (soundName) {
      case "jarClink":
        this.playJarClink(ctx);
        break;
      case "ballBounce":
        this.playBallBounce(ctx);
        break;
      case "jarShake":
        this.playJarShake(ctx);
        break;
    }
  }

  /**
   * Jar clink: short metallic tap sound
   */
  private playJarClink(ctx: AudioContext): void {
    const vol = this.volumes.jarClink;
    const now = ctx.currentTime;

    // High-frequency ping
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(vol * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // Secondary harmonic for glass-like quality
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(2400, now);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.06);
    gain2.gain.setValueAtTime(vol * 0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.1);
  }

  /**
   * Ball bounce: short thud/pop sound
   */
  private playBallBounce(ctx: AudioContext): void {
    const vol = this.volumes.ballBounce;
    const now = ctx.currentTime;

    // Low thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    gain.gain.setValueAtTime(vol * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // Noise burst for impact texture
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(vol * 0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Jar shake: rattling noise burst
   */
  private playJarShake(ctx: AudioContext): void {
    const vol = this.volumes.jarShake;
    const now = ctx.currentTime;
    const duration = 0.3;

    // Series of short rattles
    for (let i = 0; i < 4; i++) {
      const offset = i * 0.07;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600 + Math.random() * 400, now + offset);
      gain.gain.setValueAtTime(vol * 0.4, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.05);
    }

    // Filtered noise for shaking texture
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Amplitude modulation for rattle effect
      const env = Math.sin((i / ctx.sampleRate) * Math.PI * 20) * 0.5 + 0.5;
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    noise.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 2;
    noiseGain.gain.setValueAtTime(vol * 0.25, now);
    noiseGain.gain.linearRampToValueAtTime(0, now + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Stop all sounds (close and recreate context)
   */
  stopAll(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  /**
   * Stop a specific sound (no-op for synthesized sounds, they auto-stop)
   */
  stop(_soundName: SoundName): void {
    // Synthesized sounds are short and self-terminating
  }

  /**
   * Set volume for a specific sound
   */
  setVolume(soundName: SoundName, volume: number): void {
    this.volumes[soundName] = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set master volume for all sounds
   */
  setMasterVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.volumes.jarClink = clamped;
    this.volumes.ballBounce = clamped;
    this.volumes.jarShake = clamped;
  }

  mute(): void {
    this.muted = true;
  }

  unmute(): void {
    this.muted = false;
  }

  toggleMute(): void {
    this.muted = !this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.initialized = false;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
