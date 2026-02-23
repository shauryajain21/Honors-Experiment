-- Supabase schema for Honors Experiment
-- Run this in the Supabase SQL Editor to create the required tables

-- Experiment sessions (one per participant)
CREATE TABLE experiment_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sona_id TEXT UNIQUE NOT NULL,
  red_jar_percentage INTEGER,
  green_jar_percentage INTEGER,
  red_jar_initial_probability INTEGER,
  red_jar_initial_confidence INTEGER,
  green_jar_initial_probability INTEGER,
  green_jar_initial_confidence INTEGER,
  experiment_start_time TIMESTAMPTZ,
  experiment_end_time TIMESTAMPTZ,
  demographics_gender TEXT,
  demographics_academic_year TEXT,
  demographics_major TEXT,
  demographics_minor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training trials
CREATE TABLE training_trials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sona_id TEXT NOT NULL REFERENCES experiment_sessions(sona_id),
  trial_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ,
  sample_balls JSONB,
  correct_jar INTEGER,
  incorrect_jar INTEGER,
  selected_jar INTEGER,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sona_id, trial_number)
);

-- Experiment trials (phases 1-3)
CREATE TABLE experiment_trials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sona_id TEXT NOT NULL REFERENCES experiment_sessions(sona_id),
  phase INTEGER NOT NULL CHECK (phase IN (1, 2, 3)),
  trial_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ,
  jar_type TEXT,
  jar_percentage INTEGER,
  drawn_ball TEXT,
  ball_sequence_length INTEGER,
  estimated_probability INTEGER,
  confidence INTEGER,
  reaction_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sona_id, phase, trial_number)
);

-- Enable Row Level Security
ALTER TABLE experiment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_trials ENABLE ROW LEVEL SECURITY;

-- Allow inserts/updates from the anon key (the app uses anon key)
CREATE POLICY "Allow insert for anon" ON experiment_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for anon" ON experiment_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow select for anon" ON experiment_sessions FOR SELECT USING (true);

CREATE POLICY "Allow insert for anon" ON training_trials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for anon" ON training_trials FOR UPDATE USING (true);
CREATE POLICY "Allow select for anon" ON training_trials FOR SELECT USING (true);

CREATE POLICY "Allow insert for anon" ON experiment_trials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for anon" ON experiment_trials FOR UPDATE USING (true);
CREATE POLICY "Allow select for anon" ON experiment_trials FOR SELECT USING (true);
