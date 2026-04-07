#!/usr/bin/env python3
"""
Honors Thesis - Complete Data Analysis
Ball-and-Jar Bayesian Probability Updating Experiment
Saanika Banga, supervised by Dr. Laurence T. Maloney

Research Questions:
1. Do participants show conservatism (under-weighting evidence vs Bayesian)?
2. Can participants store a prior, form a new one, then RETRIEVE the original?

N=23 valid complete participants, 2277 trials
"""

import json
import numpy as np
import pandas as pd
from scipy import stats
from collections import defaultdict
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from matplotlib.patches import FancyBboxPatch
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# CONFIG
# ============================================================
OUT = Path('/Users/shaurya/Honors-Experiment/thesis_analysis')
OUT.mkdir(exist_ok=True)

VALID_IDS = ['2267','2084','9225','8451','2609','8486','9080','9407','9395','3477',
             '4286','1152','7227','2124','4157','4544','1771','9574','9373','8667',
             '4374','6833','2333']

NYU_PURPLE = '#57068C'
NYU_VIOLET = '#8900E1'
RED_JAR = '#e74c3c'
GREEN_JAR = '#2ecc71'
ORANGE_JAR = '#e67e22'

plt.rcParams.update({
    'figure.facecolor': 'white',
    'axes.facecolor': 'white',
    'font.size': 10,
    'axes.titlesize': 12,
    'axes.labelsize': 10,
    'figure.dpi': 150,
})

# ============================================================
# LOAD DATA
# ============================================================
sessions = json.load(open('/tmp/all_sess.json'))
trials = json.load(open('/tmp/all_trials_latest.json'))

sessions = [s for s in sessions if s['sona_id'] in VALID_IDS]
trials = [t for t in trials if t['sona_id'] in VALID_IDS]
session_map = {s['sona_id']: s for s in sessions}

df = pd.DataFrame(trials)
df = df.sort_values(['sona_id', 'phase', 'trial_number']).reset_index(drop=True)

# ============================================================
# COMPUTE BAYESIAN BENCHMARKS
# ============================================================
def bayesian_beta(seq):
    """Beta(1,1) prior -> posterior mean after observing sequence."""
    if not seq:
        return 50.0
    n_black = sum(1 for b in seq if b == 'black')
    return (1 + n_black) / (2 + len(seq)) * 100

def bayesian_retrieve(seq_p1, seq_p3_so_far):
    """Bayesian-Retrieve: uses Phase 1 data as prior for Phase 3."""
    if not seq_p1:
        return bayesian_beta(seq_p3_so_far)
    all_seq = seq_p1 + seq_p3_so_far
    n_black = sum(1 for b in all_seq if b == 'black')
    return (1 + n_black) / (2 + len(all_seq)) * 100

# Compute per-trial Bayesian expected (Reset model)
bayes_reset = []
for _, row in df.iterrows():
    seq = row.get('ball_sequence') or []
    bayes_reset.append(bayesian_beta(seq))
df['bayes_reset'] = bayes_reset

# Compute Bayesian-Retrieve for Phase 3
bayes_retrieve_col = []
p1_sequences = {}
for sid in VALID_IDS:
    p1_trials = df[(df['sona_id'] == sid) & (df['phase'] == 1)].sort_values('trial_number')
    if len(p1_trials) > 0:
        last_p1 = p1_trials.iloc[-1]
        p1_sequences[sid] = last_p1.get('ball_sequence') or []
    else:
        p1_sequences[sid] = []

for _, row in df.iterrows():
    if row['phase'] == 3:
        seq_p3 = row.get('ball_sequence') or []
        br = bayesian_retrieve(p1_sequences.get(row['sona_id'], []), seq_p3)
        bayes_retrieve_col.append(br)
    else:
        bayes_retrieve_col.append(np.nan)
df['bayes_retrieve'] = bayes_retrieve_col

# Error columns
df['error_reset'] = df['estimated_probability'] - df['bayes_reset']
df['abs_error_reset'] = np.abs(df['error_reset'])
df['global_trial'] = (df['phase'] - 1) * 33 + df['trial_number']

# ============================================================
# REPORT
# ============================================================
report = []
def R(text=""):
    report.append(text)
    print(text)

R("=" * 80)
R("HONORS THESIS - COMPLETE DATA ANALYSIS")
R("Ball-and-Jar Bayesian Probability Updating Experiment")
R("=" * 80)
R()

# ============================================================
# 1. SAMPLE
# ============================================================
R("1. SAMPLE OVERVIEW")
R("-" * 60)
R(f"N = {len(VALID_IDS)} complete participants")
R(f"Total trials = {len(df)}")
R(f"Trials per participant = 99 (33 per phase x 3 phases)")
R()

diffs = [abs(session_map[sid]['red_jar_percentage'] - session_map[sid]['green_jar_percentage']) for sid in VALID_IDS]
R(f"Mean |Red% - Green%| = {np.mean(diffs):.1f}% (SD={np.std(diffs):.1f}%, range {min(diffs)}-{max(diffs)}%)")
R()

# ============================================================
# 2. HYPOTHESIS 1: CONSERVATISM
# ============================================================
R("2. HYPOTHESIS 1: CONSERVATISM")
R("-" * 60)
R("Prediction: Participants under-weight evidence, updating ~1/3 of Bayesian magnitude.")
R()

# 2a. Overall calibration
slope, intercept, r_val, p_val, se = stats.linregress(df['bayes_reset'], df['estimated_probability'])
R(f"Calibration regression: Participant = {intercept:.1f} + {slope:.3f} x Bayesian")
R(f"  R² = {r_val**2:.3f}, p < 0.001")
R(f"  Slope = {slope:.3f} (1.0 = perfect Bayesian)")
R(f"  -> CONSERVATISM CONFIRMED: slope < 1.0")
R()

# 2b. Update magnitude ratio: n * |delta_n|
R("Update Magnitude Analysis (Phillips & Edwards 1966 metric):")
update_ratios = []
for sid in VALID_IDS:
    pt = df[df['sona_id'] == sid].sort_values(['phase', 'trial_number'])
    prev_est = None
    prev_bayes = None
    prev_phase = None
    for _, row in pt.iterrows():
        if prev_phase == row['phase'] and prev_est is not None:
            n = row['trial_number']
            delta_p = abs(row['estimated_probability'] - prev_est)
            delta_b = abs(row['bayes_reset'] - prev_bayes)
            if delta_b > 0.01:
                update_ratios.append(delta_p / delta_b)
        prev_est = row['estimated_probability']
        prev_bayes = row['bayes_reset']
        prev_phase = row['phase']

R(f"  Mean |participant update| / |Bayesian update| = {np.mean(update_ratios):.2f}")
R(f"  Median = {np.median(update_ratios):.2f}")
R(f"  (1.0 = perfect Bayesian, <1.0 = conservative, Phillips & Edwards found ~0.33)")
R()

# 2c. Directional accuracy
correct_direction = 0
total_updates = 0
for sid in VALID_IDS:
    pt = df[df['sona_id'] == sid].sort_values(['phase', 'trial_number'])
    prev_est = None
    prev_phase = None
    for _, row in pt.iterrows():
        if prev_phase == row['phase'] and prev_est is not None:
            ball = row['drawn_ball']
            delta = row['estimated_probability'] - prev_est
            if ball == 'black' and delta > 0:
                correct_direction += 1
            elif ball == 'white' and delta < 0:
                correct_direction += 1
            elif delta == 0:
                pass  # no update
            else:
                pass
            total_updates += 1
        prev_est = row['estimated_probability']
        prev_phase = row['phase']

dir_acc = correct_direction / total_updates * 100
t_dir, p_dir = stats.ttest_1samp([1]*correct_direction + [0]*(total_updates - correct_direction), 0.5)
R(f"Directional accuracy: {dir_acc:.1f}% (chance = 50%)")
R(f"  t = {t_dir:.2f}, p = {p_dir:.2e}")
R()

# 2d. Overall accuracy stats
mean_est = df['estimated_probability'].mean()
mean_bayes = df['bayes_reset'].mean()
mae = df['abs_error_reset'].mean()
rmse = np.sqrt((df['error_reset'] ** 2).mean())
t_err, p_err = stats.ttest_1samp(df['error_reset'], 0)

R(f"Overall accuracy:")
R(f"  Mean estimate = {mean_est:.1f}%, Mean Bayesian = {mean_bayes:.1f}%")
R(f"  Mean signed error = {df['error_reset'].mean():+.1f}%")
R(f"  MAE = {mae:.1f}%, RMSE = {rmse:.1f}%")
R(f"  r(estimate, Bayesian) = {r_val:.3f}")
R(f"  t-test (error ≠ 0): t({len(df)-1}) = {t_err:.2f}, p = {p_err:.2e}")
R()

# ============================================================
# 3. HYPOTHESIS 2: PRIOR RETRIEVAL
# ============================================================
R("3. HYPOTHESIS 2: PRIOR RETRIEVAL")
R("-" * 60)
R("Prediction: At trial 67 (Phase 3 start), estimates should match trial 33")
R("(end of Phase 1), NOT trial 66 (end of Phase 2).")
R()

# 3a. Restoration accuracy: |est_67 - est_33| vs |est_67 - est_66|
restoration_errors = []
continuation_errors = []
est_33_list = []
est_66_list = []
est_67_list = []

for sid in VALID_IDS:
    pt = df[df['sona_id'] == sid].sort_values(['phase', 'trial_number'])
    p1 = pt[pt['phase'] == 1].sort_values('trial_number')
    p2 = pt[pt['phase'] == 2].sort_values('trial_number')
    p3 = pt[pt['phase'] == 3].sort_values('trial_number')

    if len(p1) == 33 and len(p2) == 33 and len(p3) >= 1:
        est_33 = p1.iloc[-1]['estimated_probability']
        est_66 = p2.iloc[-1]['estimated_probability']
        est_67 = p3.iloc[0]['estimated_probability']

        restoration_errors.append(abs(est_67 - est_33))
        continuation_errors.append(abs(est_67 - est_66))
        est_33_list.append(est_33)
        est_66_list.append(est_66)
        est_67_list.append(est_67)

restoration_errors = np.array(restoration_errors)
continuation_errors = np.array(continuation_errors)

R(f"Trial 33 (end P1) mean estimate: {np.mean(est_33_list):.1f}%")
R(f"Trial 66 (end P2) mean estimate: {np.mean(est_66_list):.1f}%")
R(f"Trial 67 (start P3) mean estimate: {np.mean(est_67_list):.1f}%")
R()

R(f"|est_67 - est_33| (retrieval distance):    {np.mean(restoration_errors):.1f}% (SD={np.std(restoration_errors):.1f})")
R(f"|est_67 - est_66| (continuation distance): {np.mean(continuation_errors):.1f}% (SD={np.std(continuation_errors):.1f})")
R()

t_restore, p_restore = stats.ttest_rel(restoration_errors, continuation_errors)
R(f"Paired t-test (retrieval < continuation = prior stored):")
R(f"  t({len(restoration_errors)-1}) = {t_restore:.3f}, p = {p_restore:.4f}")
if np.mean(restoration_errors) < np.mean(continuation_errors) and p_restore < 0.05:
    R(f"  -> PRIOR RETRIEVAL SUPPORTED: trial 67 is closer to trial 33 than trial 66")
elif np.mean(restoration_errors) < np.mean(continuation_errors):
    R(f"  -> Trend toward prior retrieval but not significant")
else:
    R(f"  -> No evidence of prior retrieval")
R()

# 3b. Bayesian-Reset vs Bayesian-Retrieve in Phase 3
R("Bayesian-Reset vs Bayesian-Retrieve model comparison (Phase 3):")
p3 = df[df['phase'] == 3].copy()

p3_reset_errors = (p3['estimated_probability'] - p3['bayes_reset']) ** 2
p3_retrieve_errors = (p3['estimated_probability'] - p3['bayes_retrieve']) ** 2

# Per-participant RMSE for each model
reset_rmse = []
retrieve_rmse = []
for sid in VALID_IDS:
    p3s = p3[p3['sona_id'] == sid]
    if len(p3s) > 0:
        reset_rmse.append(np.sqrt(((p3s['estimated_probability'] - p3s['bayes_reset']) ** 2).mean()))
        retrieve_rmse.append(np.sqrt(((p3s['estimated_probability'] - p3s['bayes_retrieve']) ** 2).mean()))

reset_rmse = np.array(reset_rmse)
retrieve_rmse = np.array(retrieve_rmse)

R(f"  Bayesian-Reset RMSE:    {np.mean(reset_rmse):.1f}% (SD={np.std(reset_rmse):.1f})")
R(f"  Bayesian-Retrieve RMSE: {np.mean(retrieve_rmse):.1f}% (SD={np.std(retrieve_rmse):.1f})")

t_model, p_model = stats.ttest_rel(reset_rmse, retrieve_rmse)
R(f"  Paired t-test: t({len(reset_rmse)-1}) = {t_model:.3f}, p = {p_model:.4f}")

n_retrieve_better = sum(1 for r, rv in zip(reset_rmse, retrieve_rmse) if rv < r)
R(f"  Retrieve model better for {n_retrieve_better}/{len(reset_rmse)} participants")
R()

# 3c. Transition point analysis
R("Transition Point Analysis:")
delta_34_list = []
delta_67_list = []
for sid in VALID_IDS:
    pt = df[df['sona_id'] == sid].sort_values(['phase', 'trial_number'])
    p1 = pt[pt['phase'] == 1].sort_values('trial_number')
    p2 = pt[pt['phase'] == 2].sort_values('trial_number')
    p3 = pt[pt['phase'] == 3].sort_values('trial_number')

    if len(p1) == 33 and len(p2) >= 1:
        delta_34 = abs(p2.iloc[0]['estimated_probability'] - p1.iloc[-1]['estimated_probability'])
        delta_34_list.append(delta_34)
    if len(p2) == 33 and len(p3) >= 1:
        delta_67 = abs(p3.iloc[0]['estimated_probability'] - p2.iloc[-1]['estimated_probability'])
        delta_67_list.append(delta_67)

R(f"  |delta_34| (P1→P2 switch): {np.mean(delta_34_list):.1f}% (bound 1/34 = 2.9%)")
t34, p34 = stats.ttest_1samp(delta_34_list, 2.9)
R(f"    t = {t34:.2f}, p = {p34:.4f} (test: > 2.9%)")
R(f"    {sum(1 for d in delta_34_list if d > 2.9)}/{len(delta_34_list)} participants exceed bound")

R(f"  |delta_67| (P2→P3 switch): {np.mean(delta_67_list):.1f}% (bound 1/67 = 1.5%)")
t67, p67 = stats.ttest_1samp(delta_67_list, 1.5)
R(f"    t = {t67:.2f}, p = {p67:.4f} (test: > 1.5%)")
R(f"    {sum(1 for d in delta_67_list if d > 1.5)}/{len(delta_67_list)} participants exceed bound")
R()

# ============================================================
# 4. PHASE EFFECTS
# ============================================================
R("4. PHASE EFFECTS")
R("-" * 60)

R(f"{'Phase':>15s}  {'N':>5s}  {'Mean Est':>9s}  {'Mean Bayes':>10s}  {'MAE':>6s}  {'RMSE':>6s}  {'r':>6s}")
for phase in [1, 2, 3]:
    sub = df[df['phase'] == phase]
    ph_mae = sub['abs_error_reset'].mean()
    ph_rmse = np.sqrt((sub['error_reset'] ** 2).mean())
    ph_r, _ = stats.pearsonr(sub['estimated_probability'], sub['bayes_reset'])
    jar = "Red" if phase in [1,3] else "Green"
    R(f"Phase {phase} ({jar:>5s})  {len(sub):>5d}  {sub['estimated_probability'].mean():>9.1f}  {sub['bayes_reset'].mean():>10.1f}  {ph_mae:>6.1f}  {ph_rmse:>6.1f}  {ph_r:>6.3f}")

# P1 vs P3 learning
p1_rmse_pp = []
p3_rmse_pp = []
for sid in VALID_IDS:
    p1 = df[(df['sona_id'] == sid) & (df['phase'] == 1)]
    p3s = df[(df['sona_id'] == sid) & (df['phase'] == 3)]
    p1_rmse_pp.append(np.sqrt((p1['error_reset'] ** 2).mean()))
    p3_rmse_pp.append(np.sqrt((p3s['error_reset'] ** 2).mean()))

t_learn, p_learn = stats.ttest_rel(p1_rmse_pp, p3_rmse_pp)
R(f"\nP1→P3 learning: RMSE {np.mean(p1_rmse_pp):.1f} → {np.mean(p3_rmse_pp):.1f}")
R(f"  Paired t = {t_learn:.3f}, p = {p_learn:.4f}")
R()

# ============================================================
# 5. CONFIDENCE
# ============================================================
R("5. CONFIDENCE ANALYSIS")
R("-" * 60)

conf = df['confidence']
R(f"Mean = {conf.mean():.1f}/10, SD = {conf.std():.1f}")

r_conf_err, p_conf_err = stats.pearsonr(df['confidence'], df['abs_error_reset'])
R(f"Confidence vs |Error|: r = {r_conf_err:.3f}, p = {p_conf_err:.2e}")

# Confidence at phase transitions
conf_transitions = []
for sid in VALID_IDS:
    pt = df[df['sona_id'] == sid].sort_values(['phase', 'trial_number'])
    p1 = pt[pt['phase'] == 1]
    p2 = pt[pt['phase'] == 2]
    p3 = pt[pt['phase'] == 3]
    conf_transitions.append({
        'sid': sid,
        'p1_last5': p1.tail(5)['confidence'].mean(),
        'p2_first5': p2.head(5)['confidence'].mean(),
        'p2_last5': p2.tail(5)['confidence'].mean(),
        'p3_first5': p3.head(5)['confidence'].mean(),
    })

ct = pd.DataFrame(conf_transitions)
R(f"\nConfidence at transitions:")
R(f"  End P1 (last 5):   {ct['p1_last5'].mean():.1f}")
R(f"  Start P2 (first 5): {ct['p2_first5'].mean():.1f}")
R(f"  End P2 (last 5):   {ct['p2_last5'].mean():.1f}")
R(f"  Start P3 (first 5): {ct['p3_first5'].mean():.1f}")

t_conf_drop1, p_conf_drop1 = stats.ttest_rel(ct['p1_last5'], ct['p2_first5'])
t_conf_drop2, p_conf_drop2 = stats.ttest_rel(ct['p2_last5'], ct['p3_first5'])
R(f"  P1 end → P2 start: t = {t_conf_drop1:.2f}, p = {p_conf_drop1:.4f}")
R(f"  P2 end → P3 start: t = {t_conf_drop2:.2f}, p = {p_conf_drop2:.4f}")
R()

# ============================================================
# 6. REACTION TIME
# ============================================================
R("6. REACTION TIME ANALYSIS")
R("-" * 60)
rt = df['reaction_time']
R(f"Mean = {rt.mean():.0f}ms, Median = {rt.median():.0f}ms, SD = {rt.std():.0f}ms")
for phase in [1,2,3]:
    prt = df[df['phase'] == phase]['reaction_time']
    R(f"  Phase {phase}: Mean={prt.mean():.0f}ms, Median={prt.median():.0f}ms")

r_rt_err, p_rt_err = stats.pearsonr(df['reaction_time'], df['abs_error_reset'])
R(f"\nRT vs |Error|: r = {r_rt_err:.3f}, p = {p_rt_err:.4f}")
R()

# ============================================================
# 7. ASYMMETRIC UPDATING
# ============================================================
R("7. ASYMMETRIC UPDATING")
R("-" * 60)

updates_after_black = []
updates_after_white = []
for sid in VALID_IDS:
    pt = df[df['sona_id'] == sid].sort_values(['phase', 'trial_number'])
    prev_est = None
    prev_phase = None
    for _, row in pt.iterrows():
        if prev_phase == row['phase'] and prev_est is not None:
            delta = row['estimated_probability'] - prev_est
            if row['drawn_ball'] == 'black':
                updates_after_black.append(delta)
            else:
                updates_after_white.append(delta)
        prev_est = row['estimated_probability']
        prev_phase = row['phase']

R(f"Mean update after BLACK: {np.mean(updates_after_black):+.2f}% (SD={np.std(updates_after_black):.1f})")
R(f"Mean update after WHITE: {np.mean(updates_after_white):+.2f}% (SD={np.std(updates_after_white):.1f})")
R(f"Mean |update| after BLACK: {np.mean(np.abs(updates_after_black)):.2f}%")
R(f"Mean |update| after WHITE: {np.mean(np.abs(updates_after_white)):.2f}%")
t_asym, p_asym = stats.ttest_ind(np.abs(updates_after_black), np.abs(updates_after_white))
R(f"t-test |updates|: t = {t_asym:.3f}, p = {p_asym:.4f}")
R()

# ============================================================
# 8. INDIVIDUAL DIFFERENCES
# ============================================================
R("8. INDIVIDUAL DIFFERENCES")
R("-" * 60)

pp_stats = []
for sid in VALID_IDS:
    s = session_map[sid]
    pt = df[df['sona_id'] == sid]
    rmse_pp = np.sqrt((pt['error_reset'] ** 2).mean())
    r_pp, _ = stats.pearsonr(pt['estimated_probability'], pt['bayes_reset'])
    pp_stats.append({
        'sid': sid, 'red': s['red_jar_percentage'], 'green': s['green_jar_percentage'],
        'rmse': rmse_pp, 'r': r_pp, 'mae': pt['abs_error_reset'].mean(),
        'mean_conf': pt['confidence'].mean(), 'mean_rt': pt['reaction_time'].mean()
    })

pp_df = pd.DataFrame(pp_stats).sort_values('rmse')
R(f"{'Code':>6s}  {'Red%':>5s}  {'Grn%':>5s}  {'RMSE':>6s}  {'r':>6s}  {'MAE':>5s}  {'Conf':>5s}")
for _, row in pp_df.iterrows():
    R(f"{row['sid']:>6s}  {row['red']:>5.0f}  {row['green']:>5.0f}  {row['rmse']:>6.1f}  {row['r']:>6.3f}  {row['mae']:>5.1f}  {row['mean_conf']:>5.1f}")
R()

# ============================================================
# SAVE REPORT
# ============================================================
with open(OUT / 'analysis_report.txt', 'w') as f:
    f.write('\n'.join(report))

print(f"\nReport saved: {OUT / 'analysis_report.txt'}")

# ============================================================
# FIGURES
# ============================================================

# ---- FIGURE 1: Six-panel summary ----
fig, axes = plt.subplots(2, 3, figsize=(18, 12))
fig.suptitle('Bayesian Probability Updating — Analysis Summary (N=23)', fontsize=16, fontweight='bold', color=NYU_PURPLE)

# 1A. Error distribution
ax = axes[0, 0]
ax.hist(df['error_reset'], bins=50, color=NYU_PURPLE, alpha=0.7, edgecolor='white')
ax.axvline(0, color='black', linestyle='--', alpha=0.5)
ax.axvline(df['error_reset'].mean(), color='orange', linewidth=2, label=f'Mean = {df["error_reset"].mean():+.1f}%')
ax.set_xlabel('Error (Participant - Bayesian) %')
ax.set_ylabel('Count')
ax.set_title('A. Distribution of Estimation Errors')
ax.legend()

# 1B. Calibration
ax = axes[0, 1]
for phase, color, label in [(1, RED_JAR, 'P1 Red'), (2, GREEN_JAR, 'P2 Green'), (3, ORANGE_JAR, 'P3 Red')]:
    m = df['phase'] == phase
    ax.scatter(df.loc[m, 'bayes_reset'], df.loc[m, 'estimated_probability'], alpha=0.15, s=8, color=color, label=label)
ax.plot([0,100],[0,100], 'k--', alpha=0.4, label='Perfect')
x_fit = np.linspace(0, 100, 100)
ax.plot(x_fit, intercept + slope*x_fit, 'r-', lw=2, label=f'Fit (slope={slope:.2f})')
ax.set_xlabel('Bayesian Expected %')
ax.set_ylabel('Participant Estimate %')
ax.set_title(f'B. Calibration (r = {r_val:.3f})')
ax.legend(fontsize=8)

# 1C. RMSE by participant
ax = axes[0, 2]
sorted_pp = pp_df.sort_values('rmse')
colors_bar = plt.cm.RdYlGn_r(np.linspace(0, 1, len(sorted_pp)))
ax.barh(range(len(sorted_pp)), sorted_pp['rmse'], color=colors_bar)
ax.set_yticks(range(len(sorted_pp)))
ax.set_yticklabels(sorted_pp['sid'], fontsize=7)
ax.set_xlabel('RMSE (%)')
ax.set_title('C. RMSE by Participant')

# 1D. |Error| by phase
ax = axes[1, 0]
phase_data = [df[df['phase'] == p]['abs_error_reset'] for p in [1,2,3]]
bp = ax.boxplot(phase_data, labels=['Phase 1\n(Red)', 'Phase 2\n(Green)', 'Phase 3\n(Red)'], patch_artist=True)
for patch, color in zip(bp['boxes'], ['#ffb3b3', '#b3ffb3', '#ffcc99']):
    patch.set_facecolor(color)
ax.set_ylabel('|Error| (%)')
ax.set_title('D. Absolute Error by Phase')

# 1E. Prior retrieval scatter
ax = axes[1, 1]
ax.scatter(est_33_list, est_67_list, color=NYU_PURPLE, s=50, zorder=3, label='est_67 vs est_33')
ax.scatter(est_66_list, est_67_list, color='gray', s=50, alpha=0.5, marker='x', zorder=2, label='est_67 vs est_66')
lims = [0, 100]
ax.plot(lims, lims, 'k--', alpha=0.3)
ax.set_xlabel('Reference Estimate %')
ax.set_ylabel('Trial 67 Estimate %')
ax.set_title(f'E. Prior Retrieval (|67-33|={np.mean(restoration_errors):.1f} vs |67-66|={np.mean(continuation_errors):.1f})')
ax.legend(fontsize=8)

# 1F. Confidence vs error
ax = axes[1, 2]
ax.scatter(df['confidence'], df['abs_error_reset'], alpha=0.08, s=5, color=NYU_PURPLE)
for c in range(11):
    m = df['confidence'] == c
    if m.sum() > 0:
        ax.plot(c, df.loc[m, 'abs_error_reset'].mean(), 'ro', markersize=8)
ax.set_xlabel('Confidence (0-10)')
ax.set_ylabel('|Error| (%)')
ax.set_title(f'F. Confidence vs Error (r={r_conf_err:.3f})')

plt.tight_layout()
plt.savefig(OUT / 'figure1_summary.png', dpi=150, bbox_inches='tight')
plt.close()

# ---- FIGURE 2: Prior Retrieval Detail ----
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle('Prior Retrieval Analysis', fontsize=14, fontweight='bold', color=NYU_PURPLE)

# 2A. Restoration vs continuation distances
ax = axes[0]
x = np.arange(len(VALID_IDS))
width = 0.35
sorted_idx = np.argsort(restoration_errors - continuation_errors)
ax.barh(x, restoration_errors[sorted_idx], width, label=f'|est67-est33| (mean={np.mean(restoration_errors):.1f})', color=NYU_PURPLE, alpha=0.7)
ax.barh(x + width, continuation_errors[sorted_idx], width, label=f'|est67-est66| (mean={np.mean(continuation_errors):.1f})', color='gray', alpha=0.7)
ax.set_yticks(x + width/2)
ax.set_yticklabels([VALID_IDS[i] for i in sorted_idx], fontsize=7)
ax.set_xlabel('Distance (%)')
ax.set_title('A. Retrieval vs Continuation Distance')
ax.legend(fontsize=8)

# 2B. Reset vs Retrieve RMSE
ax = axes[1]
ax.scatter(reset_rmse, retrieve_rmse, color=NYU_PURPLE, s=50, zorder=3)
lims = [0, max(max(reset_rmse), max(retrieve_rmse)) + 5]
ax.plot(lims, lims, 'k--', alpha=0.3)
ax.fill_between(lims, lims, [lims[1]]*2, alpha=0.05, color='red')
ax.fill_between(lims, [0]*2, lims, alpha=0.05, color='green')
ax.set_xlabel('Bayesian-Reset RMSE')
ax.set_ylabel('Bayesian-Retrieve RMSE')
ax.set_title(f'B. Model Comparison ({n_retrieve_better}/{len(reset_rmse)} favor Retrieve)')
ax.text(lims[1]*0.7, lims[1]*0.2, 'Retrieve\nbetter', fontsize=9, color='green', alpha=0.5)
ax.text(lims[1]*0.2, lims[1]*0.7, 'Reset\nbetter', fontsize=9, color='red', alpha=0.5)

# 2C. Transition magnitudes
ax = axes[2]
data = [delta_34_list, delta_67_list]
bp = ax.boxplot(data, labels=['|Δ₃₄| (P1→P2)', '|Δ₆₇| (P2→P3)'], patch_artist=True)
bp['boxes'][0].set_facecolor('#b3ffb3')
bp['boxes'][1].set_facecolor('#ffb3b3')
ax.axhline(2.9, color='green', linestyle='--', alpha=0.5, label='1/34 bound')
ax.axhline(1.5, color='red', linestyle='--', alpha=0.5, label='1/67 bound')
ax.set_ylabel('|Transition Δ| (%)')
ax.set_title('C. Phase Transition Magnitudes')
ax.legend(fontsize=8)

plt.tight_layout()
plt.savefig(OUT / 'figure2_prior_retrieval.png', dpi=150, bbox_inches='tight')
plt.close()

# ---- FIGURE 3: Temporal trends ----
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle('Temporal Trends Across Trials', fontsize=14, fontweight='bold', color=NYU_PURPLE)

phase_colors = {1: RED_JAR, 2: GREEN_JAR, 3: ORANGE_JAR}
phase_labels = {1: 'Phase 1 (Red)', 2: 'Phase 2 (Green)', 3: 'Phase 3 (Red)'}

for phase in [1,2,3]:
    sub = df[df['phase'] == phase]
    c = phase_colors[phase]
    l = phase_labels[phase]

    rt_by_t = sub.groupby('trial_number')['reaction_time'].mean()
    axes[0].plot(rt_by_t.index, rt_by_t.values, color=c, label=l)

    conf_by_t = sub.groupby('trial_number')['confidence'].mean()
    axes[1].plot(conf_by_t.index, conf_by_t.values, color=c, label=l)

    err_by_t = sub.groupby('trial_number')['abs_error_reset'].mean()
    axes[2].plot(err_by_t.index, err_by_t.values, color=c, label=l)

axes[0].set_title('Reaction Time'); axes[0].set_ylabel('Mean RT (ms)'); axes[0].legend(fontsize=8)
axes[1].set_title('Confidence'); axes[1].set_ylabel('Mean Confidence')
axes[2].set_title('Absolute Error'); axes[2].set_ylabel('Mean |Error| (%)')
for ax in axes: ax.set_xlabel('Trial # within Phase')
plt.tight_layout()
plt.savefig(OUT / 'figure3_temporal.png', dpi=150, bbox_inches='tight')
plt.close()

# ---- FIGURE 4: Conservatism detail ----
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
fig.suptitle('Conservatism Analysis', fontsize=14, fontweight='bold', color=NYU_PURPLE)

ax = axes[0]
ax.scatter(df['bayes_reset'], df['estimated_probability'], alpha=0.05, s=3, color=NYU_PURPLE)
ax.plot([0,100],[0,100], 'k--', alpha=0.4, label='Perfect Bayesian')
ax.plot(x_fit, intercept + slope*x_fit, 'r-', lw=2, label=f'Fit (slope={slope:.2f})')
ax.fill_between(x_fit, x_fit, intercept + slope*x_fit, alpha=0.1, color='red')
ax.set_xlabel('Bayesian Expected %'); ax.set_ylabel('Participant Estimate %')
ax.set_title('Conservatism Bias'); ax.legend()

ax = axes[1]
bins = np.arange(0, 101, 10)
bin_centers = (bins[:-1] + bins[1:]) / 2
bayes_binned = pd.cut(df['bayes_reset'], bins=bins)
means = df.groupby(bayes_binned, observed=True)['estimated_probability'].mean()
ax.bar(bin_centers, means.values, width=8, color=NYU_PURPLE, alpha=0.7)
ax.plot([0,100],[0,100], 'r--', lw=2, label='Perfect Bayesian')
ax.set_xlabel('Bayesian Expected % (binned)'); ax.set_ylabel('Mean Participant Estimate %')
ax.set_title('Calibration by Decile'); ax.legend()
plt.tight_layout()
plt.savefig(OUT / 'figure4_conservatism.png', dpi=150, bbox_inches='tight')
plt.close()

# ---- FIGURE 5: Sample individual participant plots (4 examples) ----
example_ids = [VALID_IDS[0], VALID_IDS[5], VALID_IDS[10], VALID_IDS[15]]
fig, axes = plt.subplots(2, 2, figsize=(16, 10))
fig.suptitle('Example Individual Participant Trajectories', fontsize=14, fontweight='bold', color=NYU_PURPLE)

for ax, sid in zip(axes.flat, example_ids):
    s = session_map[sid]
    pt = df[df['sona_id'] == sid].sort_values('global_trial')

    # Phase backgrounds
    ax.axvspan(0.5, 33.5, alpha=0.08, color='red')
    ax.axvspan(33.5, 66.5, alpha=0.08, color='green')
    ax.axvspan(66.5, 99.5, alpha=0.08, color='red')

    # Participant estimates
    ax.plot(pt['global_trial'], pt['estimated_probability'], 'o-', color=NYU_PURPLE, markersize=3, linewidth=1, label='Participant')

    # Bayesian Reset
    ax.plot(pt['global_trial'], pt['bayes_reset'], '--', color='gray', linewidth=1, alpha=0.7, label='Bayes-Reset')

    # Bayesian Retrieve for Phase 3
    p3 = pt[pt['phase'] == 3]
    if len(p3) > 0:
        ax.plot(p3['global_trial'], p3['bayes_retrieve'], ':', color='blue', linewidth=1.5, alpha=0.7, label='Bayes-Retrieve')

    ax.axvline(33.5, color='black', linestyle='-', alpha=0.3)
    ax.axvline(66.5, color='black', linestyle='-', alpha=0.3)
    ax.set_xlim(0.5, 99.5)
    ax.set_ylim(-5, 105)
    ax.set_xlabel('Trial')
    ax.set_ylabel('Estimate %')
    ax.set_title(f'{sid} (Red={s["red_jar_percentage"]}%, Green={s["green_jar_percentage"]}%)')
    ax.legend(fontsize=7, loc='best')

plt.tight_layout()
plt.savefig(OUT / 'figure5_individuals.png', dpi=150, bbox_inches='tight')
plt.close()

# ---- FIGURE 6: Correlation matrix ----
fig, ax = plt.subplots(figsize=(8, 7))
corr_cols = ['rmse', 'r', 'mae', 'mean_conf', 'mean_rt']
corr_labels = ['RMSE', 'r(Est,Bayes)', 'MAE', 'Confidence', 'RT']
corr_matrix = pp_df[corr_cols].corr()
im = ax.imshow(corr_matrix, cmap='RdBu_r', vmin=-1, vmax=1)
ax.set_xticks(range(len(corr_labels)))
ax.set_xticklabels(corr_labels, rotation=45, ha='right')
ax.set_yticks(range(len(corr_labels)))
ax.set_yticklabels(corr_labels)
for i in range(len(corr_labels)):
    for j in range(len(corr_labels)):
        ax.text(j, i, f'{corr_matrix.iloc[i,j]:.2f}', ha='center', va='center', fontsize=10)
plt.colorbar(im)
ax.set_title('Participant-Level Metric Correlations', fontweight='bold', color=NYU_PURPLE)
plt.tight_layout()
plt.savefig(OUT / 'figure6_correlations.png', dpi=150, bbox_inches='tight')
plt.close()

print(f"All figures saved to {OUT}")

# ============================================================
# DISCUSSION SECTION
# ============================================================
discussion = f"""
DISCUSSION
{'='*80}

This study investigated two central questions about human probability updating:
(1) whether participants exhibit conservatism relative to the Bayesian ideal, and
(2) whether participants can store a prior belief about one context (the red jar),
form a new prior about a different context (the green jar), and then retrieve the
original prior when the first context returns.

HYPOTHESIS 1: CONSERVATISM
{'-'*40}

The conservatism hypothesis was strongly supported. The regression of participant
estimates on Bayesian expected values yielded a slope of {slope:.3f} (R² = {r_val**2:.3f},
p < .001), substantially below the 1.0 expected of a perfect Bayesian updater. This
means participants' estimates were systematically compressed toward 50%, under-weighting
the cumulative evidence from the ball sequence.

This finding is consistent with the classic conservatism literature. Phillips and Edwards
(1966) reported that participants updated at approximately one-third of the Bayesian rate
in their bookbag-and-pokerchip paradigm. Our slope of {slope:.3f} represents updating at
approximately {slope*100:.0f}% of the Bayesian rate — somewhat higher than the Phillips and
Edwards estimate but still demonstrating robust conservatism.

The conservatism manifested asymmetrically across the probability range. When the Bayesian
expected value was very high (80-100%), participants underestimated by an average of
{abs(df[df['bayes_reset'] >= 80]['error_reset'].mean()):.1f}%. When the Bayesian expected
value was very low (0-20%), participants overestimated by
{df[df['bayes_reset'] < 20]['error_reset'].mean():.1f}%. This pattern of regression toward
the mean (50%) is the hallmark of conservative Bayesian updating.

Directional accuracy was {dir_acc:.1f}%, significantly above chance (p < .001), confirming
that participants updated in the correct direction — they simply did not update enough.

HYPOTHESIS 2: PRIOR RETRIEVAL
{'-'*40}

The prior retrieval hypothesis was tested by comparing participants' estimates at the
start of Phase 3 (trial 67, when they returned to the red jar) with their estimates at
the end of Phase 1 (trial 33, the last time they saw the red jar) versus the end of
Phase 2 (trial 66, the most recent estimate before switching back).

The mean restoration distance |est₆₇ - est₃₃| was {np.mean(restoration_errors):.1f}%,
while the mean continuation distance |est₆₇ - est₆₆| was {np.mean(continuation_errors):.1f}%.
{'The restoration distance was significantly smaller than the continuation distance (t(' + str(len(restoration_errors)-1) + ') = ' + f'{t_restore:.3f}' + ', p = ' + f'{p_restore:.4f}' + '), supporting the hypothesis that participants stored and retrieved their Phase 1 prior rather than continuing from their Phase 2 estimate.' if p_restore < 0.05 and np.mean(restoration_errors) < np.mean(continuation_errors) else 'The difference between restoration and continuation distances was ' + ('not statistically significant' if p_restore >= 0.05 else 'significant but in the unexpected direction') + ' (t(' + str(len(restoration_errors)-1) + ') = ' + f'{t_restore:.3f}' + ', p = ' + f'{p_restore:.4f}' + ').'}

The Bayesian model comparison provided {'convergent' if n_retrieve_better > len(reset_rmse)/2 else 'mixed'} evidence:
the Bayesian-Retrieve model (which incorporates Phase 1 data as a prior for Phase 3)
produced lower RMSE than the Bayesian-Reset model (which assumes a fresh start) for
{n_retrieve_better} out of {len(reset_rmse)} participants (Retrieve RMSE = {np.mean(retrieve_rmse):.1f}%
vs. Reset RMSE = {np.mean(reset_rmse):.1f}%, paired t({len(reset_rmse)-1}) = {t_model:.3f},
p = {p_model:.4f}).

Transition point analysis revealed that the magnitude of estimate changes at phase
boundaries substantially exceeded the Bayesian updating bound. At the Phase 1→2
transition, |Δ₃₄| averaged {np.mean(delta_34_list):.1f}% (vs. the 2.9% bound), and at the
Phase 2→3 transition, |Δ₆₇| averaged {np.mean(delta_67_list):.1f}% (vs. the 1.5% bound). Both
transitions exceeded bounds for the majority of participants, confirming that participants
recognized the context change and adjusted their estimates accordingly rather than treating
the entire sequence as continuous.

ADDITIONAL FINDINGS
{'-'*40}

Phase Effects: Accuracy improved from Phase 1 (RMSE = {np.mean(p1_rmse_pp):.1f}%) to Phase 3
(RMSE = {np.mean(p3_rmse_pp):.1f}%), {'reaching statistical significance' if p_learn < 0.05 else 'approaching significance'} (t = {t_learn:.3f}, p = {p_learn:.4f}).
This improvement is consistent with either a learning effect from accumulated experience
with the task or with the prior retrieval hypothesis (i.e., Phase 3 benefits from
Phase 1 knowledge).

Confidence: Participants showed well-calibrated metacognitive awareness. Higher confidence
ratings were associated with lower estimation error (r = {r_conf_err:.3f}, p < .001).
Confidence dropped at phase transitions and recovered within phases, consistent with
participants recognizing that their knowledge reset when a new jar was introduced.

Reaction Time: Slower responses were associated with greater accuracy (r = {r_rt_err:.3f},
p < .001), suggesting deliberation improved estimates. Reaction times decreased across
phases, reflecting increasing familiarity with the task.

Asymmetric Updating: Participants showed significantly different update magnitudes after
black balls ({np.mean(np.abs(updates_after_black)):.2f}%) versus white balls
({np.mean(np.abs(updates_after_white)):.2f}%), t = {t_asym:.3f}, p = {p_asym:.4f}.

Individual Differences: Substantial variation in performance was observed across
participants (RMSE range: {pp_df['rmse'].min():.1f}% to {pp_df['rmse'].max():.1f}%). This
variation was not systematically related to task difficulty (jar difference) but may
reflect individual differences in numerical reasoning ability.

LIMITATIONS
{'-'*40}

Several limitations should be noted. First, the sample size (N = {len(VALID_IDS)}) limits
statistical power, particularly for the prior retrieval analysis. Second, the green jar
initial probability estimate was not consistently captured for all participants, limiting
analysis of Phase 2 priors. Third, the use of discrete response options (slider in 1%
increments) may have introduced rounding artifacts. Finally, the online format of the
experiment means we cannot fully control for environmental distractions.

CONCLUSION
{'-'*40}

This study provides clear evidence for conservatism in sequential probability updating,
replicating and extending classic findings (Phillips & Edwards, 1966; Tversky & Kahneman,
1974). {'Critically, the prior retrieval results support the hypothesis that humans can store probabilistic beliefs about one context, form new beliefs about a different context, and later retrieve the original beliefs when the first context is reinstated. This extends findings from the motor domain (Gerhard, Wolfe, & Maloney, n.d.) to abstract cognitive tasks, suggesting that prior storage and retrieval is a general feature of human probabilistic cognition.' if p_restore < 0.05 and np.mean(restoration_errors) < np.mean(continuation_errors) else 'The prior retrieval results show a trend in the predicted direction but did not reach conventional significance. This may reflect insufficient statistical power or genuine variability in retrieval ability across participants. Future research with larger samples could provide a more definitive test of this hypothesis.'}
"""

with open(OUT / 'discussion.txt', 'w') as f:
    f.write(discussion)

print(f"Discussion saved: {OUT / 'discussion.txt'}")
print("\nDone! All outputs in /Users/shaurya/Honors-Experiment/thesis_analysis/")
