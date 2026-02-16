import { saveAs } from "file-saver";
import { format } from "date-fns";
import type {
  TrialData,
  TrainingTrialData,
  DemographicsData,
  EstimateData,
} from "@/store/experimentStore";

interface ExperimentDataForExport {
  sonaId: string;
  experimentStartTime: string | null;
  experimentEndTime: string | null;
  redJarPercentage: number;
  greenJarPercentage: number;
  redJarInitialEstimate: EstimateData | null;
  greenJarInitialEstimate: EstimateData | null;
  trainingTrials: TrainingTrialData[];
  phase1Trials: TrialData[];
  phase2Trials: TrialData[];
  phase3Trials: TrialData[];
  demographics: DemographicsData | null;
}

/**
 * Converts experiment data to CSV format and triggers download
 * @param data - Complete experiment data
 */
export function exportToCSV(data: ExperimentDataForExport): void {
  const csvRows: string[] = [];

  // CSV Header
  csvRows.push(
    [
      "SONA_ID",
      "Phase",
      "Trial",
      "Timestamp",
      "JarType",
      "JarPercentage",
      "BallSequenceLength",
      "LatestBall",
      "EstimatedProbability",
      "Confidence",
      "ReactionTime",
    ].join(",")
  );

  // Add initial estimates
  if (data.redJarInitialEstimate) {
    csvRows.push(
      [
        data.sonaId,
        "phase1-initial-estimate",
        "0",
        data.redJarInitialEstimate.timestamp,
        "red",
        data.redJarPercentage.toString(),
        "0",
        "none",
        data.redJarInitialEstimate.probability.toString(),
        data.redJarInitialEstimate.confidence.toString(),
        "0",
      ].join(",")
    );
  }

  if (data.greenJarInitialEstimate) {
    csvRows.push(
      [
        data.sonaId,
        "phase2-initial-estimate",
        "0",
        data.greenJarInitialEstimate.timestamp,
        "green",
        data.greenJarPercentage.toString(),
        "0",
        "none",
        data.greenJarInitialEstimate.probability.toString(),
        data.greenJarInitialEstimate.confidence.toString(),
        "0",
      ].join(",")
    );
  }

  // Add training trials
  data.trainingTrials.forEach((trial) => {
    csvRows.push(
      [
        data.sonaId,
        "training",
        trial.trialNumber.toString(),
        trial.timestamp,
        "neutral",
        trial.correctJar.toString(),
        trial.sampleBalls.length.toString(),
        trial.sampleBalls[trial.sampleBalls.length - 1] || "none",
        trial.selectedJar.toString(),
        trial.isCorrect ? "1" : "0",
        "0",
      ].join(",")
    );
  });

  // Add Phase 1 trials
  data.phase1Trials.forEach((trial) => {
    csvRows.push(
      [
        data.sonaId,
        "phase1",
        trial.trialNumber.toString(),
        trial.timestamp,
        trial.jarType,
        trial.jarPercentage.toString(),
        trial.ballSequence.length.toString(),
        trial.drawnBall,
        trial.estimatedProbability.toString(),
        trial.confidence.toString(),
        trial.reactionTime.toString(),
      ].join(",")
    );
  });

  // Add Phase 2 trials
  data.phase2Trials.forEach((trial) => {
    csvRows.push(
      [
        data.sonaId,
        "phase2",
        trial.trialNumber.toString(),
        trial.timestamp,
        trial.jarType,
        trial.jarPercentage.toString(),
        trial.ballSequence.length.toString(),
        trial.drawnBall,
        trial.estimatedProbability.toString(),
        trial.confidence.toString(),
        trial.reactionTime.toString(),
      ].join(",")
    );
  });

  // Add Phase 3 trials
  data.phase3Trials.forEach((trial) => {
    csvRows.push(
      [
        data.sonaId,
        "phase3",
        trial.trialNumber.toString(),
        trial.timestamp,
        trial.jarType,
        trial.jarPercentage.toString(),
        trial.ballSequence.length.toString(),
        trial.drawnBall,
        trial.estimatedProbability.toString(),
        trial.confidence.toString(),
        trial.reactionTime.toString(),
      ].join(",")
    );
  });

  // Create CSV content
  const csvContent = csvRows.join("\n");

  // Create filename with SONA ID and timestamp
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const filename = `experiment_${data.sonaId}_${timestamp}.csv`;

  // Trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}

/**
 * Exports demographics data to a separate CSV
 * @param sonaId - Participant's SONA ID
 * @param demographics - Demographics data
 */
export function exportDemographicsCSV(
  sonaId: string,
  demographics: DemographicsData
): void {
  const csvRows: string[] = [];

  // CSV Header
  csvRows.push(["SONA_ID", "Gender", "Academic_Year", "Major", "Minor"].join(","));

  // Add demographics data
  csvRows.push(
    [
      sonaId,
      demographics.gender,
      demographics.academicYear,
      `"${demographics.major}"`,
      `"${demographics.minor}"`,
    ].join(",")
  );

  // Create CSV content
  const csvContent = csvRows.join("\n");

  // Create filename
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const filename = `demographics_${sonaId}_${timestamp}.csv`;

  // Trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}
