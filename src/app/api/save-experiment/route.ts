import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const data = await request.json();

    // Save main experiment session
    const { error: sessionError } = await supabase
      .from("experiment_sessions")
      .upsert(
        {
          sona_id: data.sonaId,
          red_jar_percentage: data.redJarPercentage,
          green_jar_percentage: data.greenJarPercentage,
          red_jar_initial_probability: data.redJarInitialEstimate?.probability,
          red_jar_initial_confidence: data.redJarInitialEstimate?.confidence,
          green_jar_initial_probability:
            data.greenJarInitialEstimate?.probability,
          green_jar_initial_confidence:
            data.greenJarInitialEstimate?.confidence,
          experiment_start_time: data.experimentStartTime,
          experiment_end_time: data.experimentEndTime,
          demographics_gender: data.demographics?.gender,
          demographics_academic_year: data.demographics?.academicYear,
          demographics_major: data.demographics?.major,
          demographics_minor: data.demographics?.minor,
        },
        { onConflict: "sona_id" }
      );

    if (sessionError) {
      console.error("Session save error:", sessionError);
      return NextResponse.json(
        { error: "Failed to save session" },
        { status: 500 }
      );
    }

    // Save training trials
    if (data.trainingTrials?.length > 0) {
      const trainingRows = data.trainingTrials.map(
        (trial: {
          trialNumber: number;
          timestamp: string;
          sampleBalls: string[];
          correctJar: number;
          incorrectJar: number;
          selectedJar: number;
          isCorrect: boolean;
        }) => ({
          sona_id: data.sonaId,
          trial_number: trial.trialNumber,
          timestamp: trial.timestamp,
          sample_balls: trial.sampleBalls,
          correct_jar: trial.correctJar,
          incorrect_jar: trial.incorrectJar,
          selected_jar: trial.selectedJar,
          is_correct: trial.isCorrect,
        })
      );

      const { error: trainingError } = await supabase
        .from("training_trials")
        .upsert(trainingRows, {
          onConflict: "sona_id,trial_number",
        });

      if (trainingError) {
        console.error("Training trials save error:", trainingError);
      }
    }

    // Save experiment trials (all phases)
    const allTrials = [
      ...(data.phase1Trials || []).map(
        (t: {
          trialNumber: number;
          timestamp: string;
          jarType: string;
          jarPercentage: number;
          drawnBall: string;
          ballSequence: string[];
          estimatedProbability: number;
          confidence: number;
          reactionTime: number;
        }) => ({ ...t, phase: 1 })
      ),
      ...(data.phase2Trials || []).map(
        (t: {
          trialNumber: number;
          timestamp: string;
          jarType: string;
          jarPercentage: number;
          drawnBall: string;
          ballSequence: string[];
          estimatedProbability: number;
          confidence: number;
          reactionTime: number;
        }) => ({ ...t, phase: 2 })
      ),
      ...(data.phase3Trials || []).map(
        (t: {
          trialNumber: number;
          timestamp: string;
          jarType: string;
          jarPercentage: number;
          drawnBall: string;
          ballSequence: string[];
          estimatedProbability: number;
          confidence: number;
          reactionTime: number;
        }) => ({ ...t, phase: 3 })
      ),
    ];

    if (allTrials.length > 0) {
      const trialRows = allTrials.map(
        (trial: {
          phase: number;
          trialNumber: number;
          timestamp: string;
          jarType: string;
          jarPercentage: number;
          drawnBall: string;
          ballSequence: string[];
          estimatedProbability: number;
          confidence: number;
          reactionTime: number;
        }) => ({
          sona_id: data.sonaId,
          phase: trial.phase,
          trial_number: trial.trialNumber,
          timestamp: trial.timestamp,
          jar_type: trial.jarType,
          jar_percentage: trial.jarPercentage,
          drawn_ball: trial.drawnBall,
          ball_sequence: trial.ballSequence,
          ball_sequence_length: trial.ballSequence.length,
          estimated_probability: trial.estimatedProbability,
          confidence: trial.confidence,
          reaction_time: trial.reactionTime,
        })
      );

      const { error: trialsError } = await supabase
        .from("experiment_trials")
        .upsert(trialRows, {
          onConflict: "sona_id,phase,trial_number",
        });

      if (trialsError) {
        console.error("Experiment trials save error:", trialsError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save experiment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
