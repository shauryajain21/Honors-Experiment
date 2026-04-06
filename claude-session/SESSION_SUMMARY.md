# Session Summary — Honors Experiment

## Project Overview
NYU Honors thesis by Saanika Banga, supervised by Dr. Laurence T. Maloney. Ball-and-jar Bayesian probability updating experiment built as a Next.js web app deployed on Railway with Supabase backend.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **State**: Zustand with localStorage persistence
- **Backend**: Supabase (PostgreSQL) via REST API
- **Deployment**: Railway (auto-deploys from `main` branch)
- **Dev server**: `npm run dev` (usually port 3000 or 3006)

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://pmnblzjhoqtmuezjzgmz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmJsempob3F0bXVlemp6Z216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTQyNjYsImV4cCI6MjA4NzM5MDI2Nn0.c7tHwl1dQ_-gH3Dka4AnIkOyjS1MYG5_n9_HYzzCoYM
```

## Railway Deployment
- URL: https://honors-experiment-production.up.railway.app/
- Auto-deploys from `main` branch on GitHub

## Supabase Database
- Project URL: https://pmnblzjhoqtmuezjzgmz.supabase.co
- Three tables:
  - `experiment_sessions` — one row per participant (sona_id, jar percentages, initial estimates, demographics, strategy)
  - `experiment_trials` — one row per trial (sona_id, phase, trial_number, drawn_ball, ball_sequence, estimated_probability, confidence, reaction_time)
  - `training_trials` — one row per training trial (sona_id, trial_number, sample_balls, correct_jar, incorrect_jar, selected_jar, is_correct)
- Conflict keys: sessions=`sona_id`, trials=`sona_id,phase,trial_number`, training=`sona_id,trial_number`

## Quick Supabase Query Template
```bash
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmJsempob3F0bXVlemp6Z216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTQyNjYsImV4cCI6MjA4NzM5MDI2Nn0.c7tHwl1dQ_-gH3Dka4AnIkOyjS1MYG5_n9_HYzzCoYM"
BASE="https://pmnblzjhoqtmuezjzgmz.supabase.co/rest/v1"
H=(-H "apikey: $API_KEY" -H "Authorization: Bearer $API_KEY")

# Get all sessions
curl -s "$BASE/experiment_sessions?select=*&order=created_at.desc" "${H[@]}" | python3 -m json.tool

# Get trials (paginate if >1000)
curl -s "$BASE/experiment_trials?select=*&order=sona_id.asc,phase.asc,trial_number.asc&limit=1000" "${H[@]}" > trials.json
```

## Experiment Design
- Training: 10 trials (pick which of 2 jars produced a sample of 10 balls)
- Phase 1: 33 trials, RED jar (unknown % black balls)
- Phase 2: 33 trials, GREEN jar (different unknown %)
- Phase 3: 33 trials, RED jar returns (same jar as Phase 1)
- Each trial: ball drawn → participant estimates probability of black balls (0-100%) → confidence (0-10)
- Balls replaced after each draw (sampling with replacement)
- 4-digit random participant code assigned on landing page

## Research Hypotheses
1. **Conservatism**: Participants under-weight evidence compared to Bayesian optimal
2. **Prior Retrieval**: When red jar returns in Phase 3, participants retrieve their Phase 1 belief (not continue from Phase 2, not reset to 50%)

## Bayesian Benchmark
Uses Beta(1,1) uniform prior updated with observed balls:
```
Bayesian estimate = (1 + n_black) / (2 + n_total) × 100%
```
No knowledge of true jar percentage needed — purely based on observed ball sequence.

## Valid Participants (N=23)
```
2267, 2084, 9225, 8451, 2609, 8486, 9080, 9407, 9395, 3477,
4286, 1152, 7227, 2124, 4157, 4544, 1771, 9574, 9373, 8667,
4374, 6833, 2333
```

## Removed Participants
- **30 system/simulated**: SONA_0001-0020, TEST_*, PING, SANITY_*, LIVE_TEST_*, FIX_TEST_*
- **6 tester (Saanika)**: saanuballeballe, saanu, saanu12345, 9233, 6441, 9901
- **3 incomplete**: 8685 (66 trials), 9906 (33 trials), 2629 (12 trials)
- **2 quality**: 5005 (garbage strategy), 6183 (near-zero estimate variance)

## Key Results (N=23, 2277 trials)

### Hypothesis 1 — Conservatism: CONFIRMED
- Calibration regression: Participant = 4.3 + 0.885 × Bayesian (R²=0.669, p<.001)
- Slope 0.885 < 1.0 → conservative, but less so than Phillips & Edwards (1966) ~0.33
- Mean signed error: -1.4%, MAE: 10.7%, RMSE: 16.6%
- r(estimate, Bayesian) = 0.818

### Hypothesis 2 — Prior Retrieval: PARTIALLY SUPPORTED
- |est67 - est33| = 22.6% (retrieval) vs |est67 - est66| = 39.4% (continuation) → p = 0.025
- BUT |est67 - 50| = 20.0% (reset) is statistically indistinguishable from retrieval (p = 0.653)
- Problem: mean trial 33 estimate (50.4%) ≈ 50%, so retrieval and reset predictions overlap
- Per-participant: 11 retrieve, 10 reset, 2 continue
- Participants clearly do NOT continue from Phase 2 (p = 0.0002)
- Some participants explicitly describe retrieval in strategies (9407, 2084, 4374)

### Phase Effects
- Phase 1: MAE=11.7%, RMSE=18.3%, r=0.784
- Phase 2: MAE=10.0%, RMSE=15.7%, r=0.835
- Phase 3: MAE=10.5%, RMSE=15.6%, r=0.849
- P1→P3 learning: RMSE 14.9→12.6 (p=0.120, not significant)

### Confidence
- Mean 6.1/10, well-calibrated (higher confidence = less error, r=-0.145, p<.001)
- Drops significantly at phase transitions (P1→P2: p=0.0008, P2→P3: p=0.008)

### Transition Points
- |Δ34| = 37.6% (bound 2.9%) — 22/23 exceed → participants recognize jar switch
- |Δ67| = 39.4% (bound 1.5%) — 23/23 exceed → participants recognize jar switch

### Individual Differences
- Best: 4374 (RMSE=3.2, explicitly used Bayes' theorem)
- Worst: 2267 (RMSE=42.8)

## Critical Bugs Fixed During This Session
1. **SONA ID not saved to Zustand store** — all participants saved as empty string, overwrote each other
2. **Per-trial saving not awaited** — `saveToBackend()` called without `await`, navigation interrupted saves
3. **`demographics_strategy` column missing** from Supabase — saves silently failed
4. **Phase 3 data loss** — 99-row upsert batch caused 409 conflicts; fixed by saving per-phase separately
5. **Store not reset between sessions** — localStorage bleed between participants
6. **Phase 2→3 transition stuck** — trial 66 "Next" button didn't trigger phase switch

## Files in This Repo

### Analysis
- `thesis_analysis/Analysis_Report.docx` — full analysis report with figures
- `thesis_analysis/Discussion.docx` — written discussion section
- `thesis_analysis/run_analysis.py` — complete analysis script
- `thesis_analysis/figure1_summary.png` through `figure6_correlations.png`
- `thesis_analysis/analysis_report.txt` — text version of report
- `thesis_analysis/discussion.txt` — text version of discussion

### Data Export
- `experiment_data_full.xlsx` — all participants formatted Excel
- `participant_strategies.xlsx` — all 23 strategy descriptions
- `full_experiment_export.csv` — CSV export of all data

### Research Documents (in /Downloads/Honors_SJ-SB/)
- `Copy of ABSTRACT.docx` — thesis abstract
- `Copy of Revised Introduction.docx` — lit review (Phillips & Edwards, Tversky & Kahneman, Zhang & Maloney, Gerhard et al.)
- `Copy of Method_Results_Saanika.docx` — full methods + hypothetical results
- `HONORS MASTER DOC.docx` — master working document with timeline, analysis plan (Tier 1/2/3), meeting notes

### Google Sheets Integration
- `google_apps_script.js` — paste into Google Sheets Apps Script for live data refresh from Supabase

### Key Source Files
- `src/app/api/save-experiment/route.ts` — API endpoint saving to Supabase (per-phase upsert)
- `src/store/experimentStore.ts` — Zustand store with all state + saveToBackend with retry
- `src/components/experiment/TrialRunner.tsx` — main trial UI, per-trial saving
- `src/app/page.tsx` — landing page with auto-generated 4-digit codes + store reset
- `src/app/experiment/phase1/page.tsx`, `phase2/page.tsx`, `phase3/page.tsx` — phase wrappers

## What Still Needs To Be Done
1. Run the missing Tier 2/3 analyses from the Master Doc (mixed-effects models)
2. Generate individual participant trajectory plots for all 23 (not just 4 examples)
3. Update discussion with corrected prior retrieval interpretation (3-way model)
4. Address the green jar initial estimate not being captured for some participants
5. Collect more participants if possible to push learning effect (p=0.120) toward significance
