#!/usr/bin/env python3
"""
Monte Carlo Simulation for Prior Retrieval Analysis
====================================================
Uses full 33-trial Phase 3 trajectories (not just trial 67) to classify
each participant as Retrieval vs Reset using trajectory likelihood comparison.

For each participant:
1. Extract Phase 1 ball sequence (to build the retrieval prior)
2. Extract Phase 3 ball sequence (the evidence they saw)
3. Simulate 10,000 noisy Bayesian agents under each model
4. Compute likelihood of actual trajectory under each model
5. Classify via Bayes factor
"""

import json
import numpy as np
from scipy import stats as sp_stats
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path('/Users/shaurya/Honors-Experiment/thesis_analysis')

VALID_IDS = ['2267','2084','9225','8451','2609','8486','9080','9407','9395','3477',
             '4286','1152','7227','2124','4157','4544','1771','9574','9373','8667',
             '4374','6833','2333']

N_SIMS = 10000
NYU_PURPLE = '#57068C'

# Load data
trials = json.load(open('/tmp/all_trials_latest.json'))
sessions = json.load(open('/tmp/all_sess.json'))
session_map = {s['sona_id']: s for s in sessions}

# ============================================================
# STEP 1: Extract per-participant data
# ============================================================
participant_data = {}
for sid in VALID_IDS:
    pt = sorted([t for t in trials if t['sona_id'] == sid],
                key=lambda t: (t['phase'], t['trial_number']))

    p1 = [t for t in pt if t['phase'] == 1]
    p2 = [t for t in pt if t['phase'] == 2]
    p3 = [t for t in pt if t['phase'] == 3]

    # Phase 1 ball sequence (for retrieval prior)
    p1_balls = p1[-1]['ball_sequence'] if p1 and p1[-1].get('ball_sequence') else []

    # Phase 3 per-trial data
    p3_estimates = [t['estimated_probability'] for t in p3]
    p3_balls = [t['drawn_ball'] for t in p3]  # individual balls per trial
    p3_sequences = [t.get('ball_sequence', []) for t in p3]  # cumulative sequences

    # Phase 1 & 2 noise calibration
    all_phase12 = [t for t in pt if t['phase'] in [1, 2]]
    errors = []
    for t in all_phase12:
        seq = t.get('ball_sequence', [])
        if seq:
            n_black = sum(1 for b in seq if b == 'black')
            bayes = (1 + n_black) / (2 + len(seq)) * 100
            errors.append(t['estimated_probability'] - bayes)

    noise_sd = np.std(errors) if errors else 15.0

    participant_data[sid] = {
        'p1_balls': p1_balls,
        'p3_estimates': p3_estimates,
        'p3_balls': p3_balls,
        'p3_sequences': p3_sequences,
        'noise_sd': noise_sd,
        'red_pct': session_map[sid]['red_jar_percentage'],
        'green_pct': session_map[sid]['green_jar_percentage'],
    }

# ============================================================
# STEP 2: Simulate agents
# ============================================================
def simulate_agent(p1_balls, p3_balls, model, noise_sd, n_sims=N_SIMS):
    """
    Simulate n_sims noisy Bayesian agents through Phase 3.

    model='retrieve': starts with Beta(1+n_black_p1, 1+n_white_p1)
    model='reset': starts with Beta(1, 1)

    Returns: array of shape (n_sims, 33) with simulated estimates
    """
    if model == 'retrieve' and p1_balls:
        alpha_0 = 1 + sum(1 for b in p1_balls if b == 'black')
        beta_0 = 1 + sum(1 for b in p1_balls if b == 'white')
    else:
        alpha_0 = 1
        beta_0 = 1

    n_trials = len(p3_balls)
    simulated = np.zeros((n_sims, n_trials))

    for sim in range(n_sims):
        alpha = alpha_0
        beta = beta_0
        for t in range(n_trials):
            # True Bayesian posterior mean
            bayes_est = alpha / (alpha + beta) * 100

            # Add participant-calibrated noise
            noisy_est = bayes_est + np.random.normal(0, noise_sd)
            noisy_est = np.clip(noisy_est, 0, 100)
            simulated[sim, t] = noisy_est

            # Update with observed ball
            if p3_balls[t] == 'black':
                alpha += 1
            else:
                beta += 1

    return simulated


def compute_log_likelihood(actual, simulated):
    """
    Compute log-likelihood of actual trajectory under simulated distribution.
    For each trial, model the simulated estimates as a Gaussian,
    then evaluate the actual estimate under that Gaussian.
    """
    n_trials = len(actual)
    log_lik = 0.0
    for t in range(n_trials):
        sim_t = simulated[:, t]
        mu = np.mean(sim_t)
        sigma = max(np.std(sim_t), 1.0)  # floor to avoid log(0)
        log_lik += sp_stats.norm.logpdf(actual[t], loc=mu, scale=sigma)
    return log_lik


# ============================================================
# STEP 3: Run classification
# ============================================================
print("=" * 80)
print("MONTE CARLO PRIOR RETRIEVAL ANALYSIS")
print(f"N = {len(VALID_IDS)} participants | {N_SIMS:,} simulations per model per participant")
print("=" * 80)
print()

results = []
for sid in VALID_IDS:
    d = participant_data[sid]

    # Simulate both models
    sim_retrieve = simulate_agent(d['p1_balls'], d['p3_balls'], 'retrieve', d['noise_sd'])
    sim_reset = simulate_agent(d['p1_balls'], d['p3_balls'], 'reset', d['noise_sd'])

    # Compute log-likelihoods
    ll_retrieve = compute_log_likelihood(d['p3_estimates'], sim_retrieve)
    ll_reset = compute_log_likelihood(d['p3_estimates'], sim_reset)

    # Bayes factor (retrieve vs reset)
    log_bf = ll_retrieve - ll_reset
    bf = np.exp(np.clip(log_bf, -500, 500))

    # Classification
    if log_bf > np.log(3):
        classification = 'RETRIEVE'
    elif log_bf < -np.log(3):
        classification = 'RESET'
    else:
        classification = 'AMBIGUOUS'

    # RMSE of each model's mean trajectory vs actual
    retrieve_mean = np.mean(sim_retrieve, axis=0)
    reset_mean = np.mean(sim_reset, axis=0)
    actual = np.array(d['p3_estimates'])

    rmse_retrieve = np.sqrt(np.mean((actual - retrieve_mean) ** 2))
    rmse_reset = np.sqrt(np.mean((actual - reset_mean) ** 2))

    results.append({
        'sid': sid,
        'll_retrieve': ll_retrieve,
        'll_reset': ll_reset,
        'log_bf': log_bf,
        'bf': bf,
        'classification': classification,
        'rmse_retrieve': rmse_retrieve,
        'rmse_reset': rmse_reset,
        'noise_sd': d['noise_sd'],
        'red_pct': d['red_pct'],
        'p1_n_black': sum(1 for b in d['p1_balls'] if b == 'black'),
        'p1_n_total': len(d['p1_balls']),
        'retrieve_mean': retrieve_mean,
        'reset_mean': reset_mean,
        'actual': actual,
    })

# ============================================================
# STEP 4: Report
# ============================================================
retrieve_count = sum(1 for r in results if r['classification'] == 'RETRIEVE')
reset_count = sum(1 for r in results if r['classification'] == 'RESET')
ambiguous_count = sum(1 for r in results if r['classification'] == 'AMBIGUOUS')

print(f"{'Code':>6s}  {'LL_Ret':>8s}  {'LL_Res':>8s}  {'log(BF)':>8s}  {'BF':>8s}  {'RMSE_R':>7s}  {'RMSE_0':>7s}  {'Class':>10s}  {'Red%':>5s}  {'P1 blk':>7s}")
print("-" * 95)
for r in sorted(results, key=lambda x: -x['log_bf']):
    bf_str = f"{r['bf']:.1f}" if r['bf'] < 1e6 else f"{r['bf']:.1e}"
    print(f"{r['sid']:>6s}  {r['ll_retrieve']:>8.1f}  {r['ll_reset']:>8.1f}  {r['log_bf']:>8.2f}  {bf_str:>8s}  {r['rmse_retrieve']:>7.1f}  {r['rmse_reset']:>7.1f}  {r['classification']:>10s}  {r['red_pct']:>5d}  {r['p1_n_black']:>3d}/{r['p1_n_total']:>2d}")

print()
print(f"Classification (BF > 3 threshold):")
print(f"  RETRIEVE:  {retrieve_count}/23 ({retrieve_count/23*100:.0f}%)")
print(f"  RESET:     {reset_count}/23 ({reset_count/23*100:.0f}%)")
print(f"  AMBIGUOUS: {ambiguous_count}/23 ({ambiguous_count/23*100:.0f}%)")
print()

# Group-level: mean log Bayes factor
mean_log_bf = np.mean([r['log_bf'] for r in results])
t_bf, p_bf = sp_stats.ttest_1samp([r['log_bf'] for r in results], 0)
print(f"Group-level mean log(BF): {mean_log_bf:.2f}")
print(f"  t({len(results)-1}) = {t_bf:.3f}, p = {p_bf:.4f}")
if mean_log_bf > 0:
    print(f"  -> Group favors RETRIEVAL model")
else:
    print(f"  -> Group favors RESET model")
print()

# RMSE comparison
mean_rmse_ret = np.mean([r['rmse_retrieve'] for r in results])
mean_rmse_res = np.mean([r['rmse_reset'] for r in results])
t_rmse, p_rmse = sp_stats.ttest_rel(
    [r['rmse_retrieve'] for r in results],
    [r['rmse_reset'] for r in results]
)
print(f"Mean trajectory RMSE:")
print(f"  Retrieve: {mean_rmse_ret:.1f}%")
print(f"  Reset:    {mean_rmse_res:.1f}%")
print(f"  Paired t = {t_rmse:.3f}, p = {p_rmse:.4f}")
n_ret_better = sum(1 for r in results if r['rmse_retrieve'] < r['rmse_reset'])
print(f"  Retrieve trajectory closer for {n_ret_better}/23 participants")
print()

# ============================================================
# STEP 5: Power analysis
# ============================================================
print("POWER ANALYSIS")
print("-" * 40)
# For each participant, simulate a "true retriever" and "true resetter"
# and see how often we correctly classify them
correct_retrieve = 0
correct_reset = 0
n_power = 1000

for sid in VALID_IDS[:10]:  # subset for speed
    d = participant_data[sid]
    for _ in range(n_power // len(VALID_IDS[:10])):
        # Simulate a true retriever
        sim_true_ret = simulate_agent(d['p1_balls'], d['p3_balls'], 'retrieve', d['noise_sd'], n_sims=1)[0]
        sim_r = simulate_agent(d['p1_balls'], d['p3_balls'], 'retrieve', d['noise_sd'], n_sims=500)
        sim_s = simulate_agent(d['p1_balls'], d['p3_balls'], 'reset', d['noise_sd'], n_sims=500)
        ll_r = compute_log_likelihood(sim_true_ret, sim_r)
        ll_s = compute_log_likelihood(sim_true_ret, sim_s)
        if ll_r > ll_s:
            correct_retrieve += 1

        # Simulate a true resetter
        sim_true_res = simulate_agent(d['p1_balls'], d['p3_balls'], 'reset', d['noise_sd'], n_sims=1)[0]
        ll_r2 = compute_log_likelihood(sim_true_res, sim_r)
        ll_s2 = compute_log_likelihood(sim_true_res, sim_s)
        if ll_s2 > ll_r2:
            correct_reset += 1

total_power_trials = n_power // len(VALID_IDS[:10]) * len(VALID_IDS[:10])
print(f"  Correct classification of true retrievers: {correct_retrieve}/{total_power_trials} ({correct_retrieve/total_power_trials*100:.0f}%)")
print(f"  Correct classification of true resetters:  {correct_reset}/{total_power_trials} ({correct_reset/total_power_trials*100:.0f}%)")
print(f"  Overall discriminability: {(correct_retrieve+correct_reset)/(2*total_power_trials)*100:.0f}%")
print()

# ============================================================
# STEP 6: Figures
# ============================================================

# Figure 1: Classification summary
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle('Monte Carlo Prior Retrieval Analysis', fontsize=14, fontweight='bold', color=NYU_PURPLE)

# 1A: Log Bayes factors
ax = axes[0]
sorted_res = sorted(results, key=lambda x: x['log_bf'])
colors = ['#e74c3c' if r['classification'] == 'RESET'
          else '#2ecc71' if r['classification'] == 'RETRIEVE'
          else '#f39c12' for r in sorted_res]
ax.barh(range(len(sorted_res)), [r['log_bf'] for r in sorted_res], color=colors)
ax.axvline(np.log(3), color='green', linestyle='--', alpha=0.5, label='BF=3 (Retrieve)')
ax.axvline(-np.log(3), color='red', linestyle='--', alpha=0.5, label='BF=1/3 (Reset)')
ax.axvline(0, color='black', linestyle='-', alpha=0.3)
ax.set_yticks(range(len(sorted_res)))
ax.set_yticklabels([r['sid'] for r in sorted_res], fontsize=7)
ax.set_xlabel('log(Bayes Factor)')
ax.set_title(f'A. Model Classification\n(Retrieve={retrieve_count}, Reset={reset_count}, Ambig={ambiguous_count})')
ax.legend(fontsize=7)

# 1B: RMSE comparison
ax = axes[1]
ax.scatter([r['rmse_reset'] for r in results],
          [r['rmse_retrieve'] for r in results],
          c=colors, s=60, zorder=3, edgecolors='white', linewidth=0.5)
lims = [0, max(max(r['rmse_reset'] for r in results), max(r['rmse_retrieve'] for r in results)) + 5]
ax.plot(lims, lims, 'k--', alpha=0.3)
ax.fill_between(lims, lims, [lims[1]]*2, alpha=0.05, color='red')
ax.fill_between(lims, [0]*2, lims, alpha=0.05, color='green')
for r in results:
    ax.annotate(r['sid'], (r['rmse_reset'], r['rmse_retrieve']), fontsize=6, alpha=0.7)
ax.set_xlabel('Reset Model RMSE (%)')
ax.set_ylabel('Retrieve Model RMSE (%)')
ax.set_title(f'B. Trajectory RMSE Comparison\n(Retrieve better: {n_ret_better}/23)')
ax.text(lims[1]*0.7, lims[1]*0.15, 'Retrieve\nbetter', fontsize=9, color='green', alpha=0.5)
ax.text(lims[1]*0.15, lims[1]*0.7, 'Reset\nbetter', fontsize=9, color='red', alpha=0.5)

# 1C: Pie chart
ax = axes[2]
sizes = [retrieve_count, reset_count, ambiguous_count]
labels = [f'Retrieve\n({retrieve_count})', f'Reset\n({reset_count})', f'Ambiguous\n({ambiguous_count})']
pie_colors = ['#2ecc71', '#e74c3c', '#f39c12']
# Only include non-zero
nonzero = [(s, l, c) for s, l, c in zip(sizes, labels, pie_colors) if s > 0]
ax.pie([x[0] for x in nonzero], labels=[x[1] for x in nonzero],
       colors=[x[2] for x in nonzero], autopct='%1.0f%%',
       textprops={'fontsize': 11}, startangle=90)
ax.set_title('C. Participant Classification')

plt.tight_layout()
plt.savefig(OUT / 'figure7_monte_carlo_classification.png', dpi=150, bbox_inches='tight')
plt.close()

# Figure 2: Example trajectories with simulation bands (4 participants)
examples = []
for cls in ['RETRIEVE', 'RESET']:
    matches = [r for r in results if r['classification'] == cls]
    if matches:
        # Pick the one with strongest evidence
        best = max(matches, key=lambda r: abs(r['log_bf']))
        examples.append(best)
# Add an ambiguous one if exists
ambig = [r for r in results if r['classification'] == 'AMBIGUOUS']
if ambig:
    examples.append(ambig[0])
# Fill to 4
remaining = [r for r in results if r not in examples]
if remaining and len(examples) < 4:
    examples.append(remaining[len(remaining)//2])

fig, axes = plt.subplots(2, 2, figsize=(16, 10))
fig.suptitle('Phase 3 Trajectories: Actual vs Simulated Models', fontsize=14, fontweight='bold', color=NYU_PURPLE)

for ax, r in zip(axes.flat, examples[:4]):
    sid = r['sid']
    d = participant_data[sid]
    x = np.arange(1, 34)

    # Simulation bands
    sim_ret = simulate_agent(d['p1_balls'], d['p3_balls'], 'retrieve', d['noise_sd'], n_sims=2000)
    sim_res = simulate_agent(d['p1_balls'], d['p3_balls'], 'reset', d['noise_sd'], n_sims=2000)

    ret_mean = np.mean(sim_ret, axis=0)
    ret_lo = np.percentile(sim_ret, 10, axis=0)
    ret_hi = np.percentile(sim_ret, 90, axis=0)

    res_mean = np.mean(sim_res, axis=0)
    res_lo = np.percentile(sim_res, 10, axis=0)
    res_hi = np.percentile(sim_res, 90, axis=0)

    # Plot bands
    ax.fill_between(x, ret_lo, ret_hi, alpha=0.15, color='green', label='Retrieve 80% CI')
    ax.fill_between(x, res_lo, res_hi, alpha=0.15, color='red', label='Reset 80% CI')

    # Plot means
    ax.plot(x, ret_mean, '--', color='green', linewidth=1.5, label='Retrieve mean')
    ax.plot(x, res_mean, '--', color='red', linewidth=1.5, label='Reset mean')

    # Plot actual
    ax.plot(x, r['actual'], 'o-', color=NYU_PURPLE, markersize=4, linewidth=1.5, label='Participant')

    # True jar percentage
    ax.axhline(d['red_pct'], color='black', linestyle=':', alpha=0.3, label=f'True red={d["red_pct"]}%')

    bf_str = f"BF={r['bf']:.1f}" if r['bf'] < 1e4 else f"BF={r['bf']:.0e}"
    ax.set_title(f"{sid} — {r['classification']} ({bf_str})", fontweight='bold')
    ax.set_xlabel('Phase 3 Trial #')
    ax.set_ylabel('Estimate %')
    ax.set_ylim(-5, 105)
    ax.legend(fontsize=7, loc='best')

plt.tight_layout()
plt.savefig(OUT / 'figure8_monte_carlo_trajectories.png', dpi=150, bbox_inches='tight')
plt.close()

print("Figures saved:")
print(f"  {OUT / 'figure7_monte_carlo_classification.png'}")
print(f"  {OUT / 'figure8_monte_carlo_trajectories.png'}")

# Save report
report_path = OUT / 'monte_carlo_report.txt'
with open(report_path, 'w') as f:
    f.write("MONTE CARLO PRIOR RETRIEVAL ANALYSIS\n")
    f.write("=" * 60 + "\n\n")
    f.write(f"N = {len(VALID_IDS)} participants\n")
    f.write(f"Simulations per model: {N_SIMS:,}\n\n")
    f.write(f"Classification (BF > 3):\n")
    f.write(f"  RETRIEVE:  {retrieve_count}/23 ({retrieve_count/23*100:.0f}%)\n")
    f.write(f"  RESET:     {reset_count}/23 ({reset_count/23*100:.0f}%)\n")
    f.write(f"  AMBIGUOUS: {ambiguous_count}/23 ({ambiguous_count/23*100:.0f}%)\n\n")
    f.write(f"Group-level mean log(BF): {mean_log_bf:.2f}\n")
    f.write(f"  t({len(results)-1}) = {t_bf:.3f}, p = {p_bf:.4f}\n")
    f.write(f"  -> Group favors {'RETRIEVAL' if mean_log_bf > 0 else 'RESET'} model\n\n")
    f.write(f"Trajectory RMSE:\n")
    f.write(f"  Retrieve: {mean_rmse_ret:.1f}%\n")
    f.write(f"  Reset:    {mean_rmse_res:.1f}%\n")
    f.write(f"  Paired t = {t_rmse:.3f}, p = {p_rmse:.4f}\n")
    f.write(f"  Retrieve closer for {n_ret_better}/23\n")

print(f"\nReport saved: {report_path}")
print("\nDone!")
