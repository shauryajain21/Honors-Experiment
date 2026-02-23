import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types
export type Phase =
  | "landing"
  | "consent"
  | "training-instructions"
  | "training-trials"
  | "main-instructions"
  | "experiment-instructions"
  | "jar-selection"
  | "phase1-trials"
  | "phase2-transition"
  | "phase2-trials"
  | "phase3-transition"
  | "phase3-trials"
  | "demographics"
  | "debrief";

export type JarColor = "red" | "green" | "neutral";
export type BallColor = "black" | "white";

export interface EstimateData {
  probability: number;
  confidence: number;
  timestamp: string;
}

export interface TrialData {
  trialNumber: number;
  timestamp: string;
  jarType: JarColor;
  jarPercentage: number;
  drawnBall: BallColor;
  ballSequence: BallColor[];
  estimatedProbability: number;
  confidence: number;
  reactionTime: number; // milliseconds
}

export interface TrainingTrialData {
  trialNumber: number;
  timestamp: string;
  sampleBalls: BallColor[];
  correctJar: number;
  incorrectJar: number;
  selectedJar: number;
  isCorrect: boolean;
}

export interface DemographicsData {
  gender: "male" | "female" | "non-binary" | "prefer-not-to-share";
  academicYear: string;
  major: string;
  minor: string;
}

interface ExperimentStore {
  // Participant Info
  sonaId: string;
  setSonaId: (id: string) => void;

  // Phase Tracking
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;

  // Consent
  consentGiven: boolean;
  setConsent: (given: boolean) => void;

  // Jar Configurations (randomized once at experiment start - 0-100%)
  redJarPercentage: number;
  greenJarPercentage: number;
  initializeJars: () => void;

  // Initial Estimates
  redJarInitialEstimate: EstimateData | null;
  greenJarInitialEstimate: EstimateData | null;
  setRedJarEstimate: (data: EstimateData) => void;
  setGreenJarEstimate: (data: EstimateData) => void;

  // Trial Data
  trainingTrials: TrainingTrialData[];
  phase1Trials: TrialData[];
  phase2Trials: TrialData[];
  phase3Trials: TrialData[];
  addTrainingTrial: (data: TrainingTrialData) => void;
  addPhase1Trial: (data: TrialData) => void;
  addPhase2Trial: (data: TrialData) => void;
  addPhase3Trial: (data: TrialData) => void;

  // Current Trial State
  currentTrialNumber: number;
  ballSequence: BallColor[];
  addBall: (color: BallColor) => void;
  resetTrialState: () => void;
  incrementTrialNumber: () => void;

  // Demographics
  demographics: DemographicsData | null;
  setDemographics: (data: DemographicsData) => void;

  // Timestamps
  experimentStartTime: string | null;
  experimentEndTime: string | null;
  setStartTime: () => void;
  setEndTime: () => void;

  // Save to backend
  saveToBackend: () => Promise<boolean>;

  // Reset
  resetExperiment: () => void;
}

export const useExperimentStore = create<ExperimentStore>()(
  persist(
    (set, get) => ({
      // Initial State
      sonaId: "",
      currentPhase: "landing",
      consentGiven: false,
      redJarPercentage: 0,
      greenJarPercentage: 0,
      redJarInitialEstimate: null,
      greenJarInitialEstimate: null,
      trainingTrials: [],
      phase1Trials: [],
      phase2Trials: [],
      phase3Trials: [],
      currentTrialNumber: 0,
      ballSequence: [],
      demographics: null,
      experimentStartTime: null,
      experimentEndTime: null,

      // Actions
      setSonaId: (id) => set({ sonaId: id }),

      setPhase: (phase) => set({ currentPhase: phase }),

      setConsent: (given) => set({ consentGiven: given }),

      initializeJars: () => {
        // Generate random percentages between 0 and 100
        const red = Math.floor(Math.random() * 101);
        const green = Math.floor(Math.random() * 101);
        set({
          redJarPercentage: red,
          greenJarPercentage: green,
        });
      },

      setRedJarEstimate: (data) => set({ redJarInitialEstimate: data }),

      setGreenJarEstimate: (data) => set({ greenJarInitialEstimate: data }),

      addTrainingTrial: (data) =>
        set((state) => ({
          trainingTrials: [...state.trainingTrials, data],
        })),

      addPhase1Trial: (data) =>
        set((state) => ({
          phase1Trials: [...state.phase1Trials, data],
        })),

      addPhase2Trial: (data) =>
        set((state) => ({
          phase2Trials: [...state.phase2Trials, data],
        })),

      addPhase3Trial: (data) =>
        set((state) => ({
          phase3Trials: [...state.phase3Trials, data],
        })),

      addBall: (color) =>
        set((state) => ({
          ballSequence: [...state.ballSequence, color],
        })),

      resetTrialState: () =>
        set({
          ballSequence: [],
          currentTrialNumber: 0,
        }),

      incrementTrialNumber: () =>
        set((state) => ({
          currentTrialNumber: state.currentTrialNumber + 1,
        })),

      setDemographics: (data) => set({ demographics: data }),

      setStartTime: () =>
        set({ experimentStartTime: new Date().toISOString() }),

      setEndTime: () => set({ experimentEndTime: new Date().toISOString() }),

      saveToBackend: async () => {
        const state = get();
        try {
          const response = await fetch("/api/save-experiment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sonaId: state.sonaId,
              redJarPercentage: state.redJarPercentage,
              greenJarPercentage: state.greenJarPercentage,
              redJarInitialEstimate: state.redJarInitialEstimate,
              greenJarInitialEstimate: state.greenJarInitialEstimate,
              trainingTrials: state.trainingTrials,
              phase1Trials: state.phase1Trials,
              phase2Trials: state.phase2Trials,
              phase3Trials: state.phase3Trials,
              demographics: state.demographics,
              experimentStartTime: state.experimentStartTime,
              experimentEndTime: state.experimentEndTime,
            }),
          });
          return response.ok;
        } catch (error) {
          console.error("Failed to save to backend:", error);
          return false;
        }
      },

      resetExperiment: () =>
        set({
          sonaId: "",
          currentPhase: "landing",
          consentGiven: false,
          redJarPercentage: 0,
          greenJarPercentage: 0,
          redJarInitialEstimate: null,
          greenJarInitialEstimate: null,
          trainingTrials: [],
          phase1Trials: [],
          phase2Trials: [],
          phase3Trials: [],
          currentTrialNumber: 0,
          ballSequence: [],
          demographics: null,
          experimentStartTime: null,
          experimentEndTime: null,
        }),
    }),
    {
      name: "experiment-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
