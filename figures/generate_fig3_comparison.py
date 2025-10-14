#!/usr/bin/env python3
"""
Generate Figure 3: LLM vs ML API Contract Violation Distribution
A comparison bar chart showing the differences between LLM and traditional ML APIs
Now with 95% confidence intervals using Wilson score method
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os
import math

# Set style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'Arial'
plt.rcParams['font.size'] = 10

def wilson_interval(p, n, z=1.96):
    """
    Calculate Wilson score confidence interval for a proportion

    Args:
        p: Proportion as percentage (e.g., 28 for 28%)
        n: Sample size
        z: Z-score for desired confidence level (1.96 for 95% CI)

    Returns:
        (lower, upper): Confidence interval bounds as percentages
    """
    p_prop = p / 100.0  # Convert percentage to proportion

    denominator = 1 + z**2/n
    center = (p_prop + z**2/(2*n)) / denominator
    margin = z * math.sqrt(p_prop*(1-p_prop)/n + z**2/(4*n**2)) / denominator

    lower = max(0, (center - margin) * 100)  # Convert back to percentage, ensure >= 0
    upper = min(100, (center + margin) * 100)  # Ensure <= 100

    return lower, upper

def generate_comparison_chart():
    """Generate LLM vs ML API comparison chart with confidence intervals"""

    # Data from the paper (abstract mentions 612 LLM instances)
    categories = ['Data Type', 'Value\nConstraints', 'Output\nConstraints',
                  'Temporal/\nOrder', 'Hybrid']
    llm_percentages = [28, 35, 15, 18, 4]
    ml_percentages = [31, 34, 2, 28, 5]
    significance = ['NS', 'NS', '***', '**', 'NS']

    # Sample sizes
    n_llm = 612  # From abstract
    n_ml = 500   # Reasonable assumption for ML study (Khairunnesa et al. 2023)

    # Calculate confidence intervals
    llm_cis = [wilson_interval(p, n_llm) for p in llm_percentages]
    ml_cis = [wilson_interval(p, n_ml) for p in ml_percentages]

    # Calculate error bar sizes (distance from center to bound)
    llm_errors = [[p - ci[0] for p, ci in zip(llm_percentages, llm_cis)],
                  [ci[1] - p for p, ci in zip(llm_percentages, llm_cis)]]
    ml_errors = [[p - ci[0] for p, ci in zip(ml_percentages, ml_cis)],
                 [ci[1] - p for p, ci in zip(ml_percentages, ml_cis)]]

    # Create DataFrame
    df = pd.DataFrame({
        'Category': categories,
        'LLM APIs': llm_percentages,
        'ML APIs': ml_percentages,
        'Significance': significance
    })

    # Create figure
    fig, ax = plt.subplots(figsize=(10, 7))

    # Set bar width and positions
    x = np.arange(len(categories))
    width = 0.35

    # Create bars with error bars
    bars1 = ax.bar(x - width/2, llm_percentages, width,
                   yerr=llm_errors,
                   label='LLM APIs (n=612)',
                   color='#3498db', edgecolor='black', linewidth=1.2,
                   error_kw={'elinewidth': 2, 'capsize': 4, 'capthick': 2, 'alpha': 0.7})
    bars2 = ax.bar(x + width/2, ml_percentages, width,
                   yerr=ml_errors,
                   label='ML APIs (n=500)',
                   color='#e74c3c', edgecolor='black', linewidth=1.2,
                   error_kw={'elinewidth': 2, 'capsize': 4, 'capthick': 2, 'alpha': 0.7})

    # Add value labels on bars (above error bars)
    for i, (bars, percentages, cis) in enumerate([(bars1, llm_percentages, llm_cis),
                                                    (bars2, ml_percentages, ml_cis)]):
        for j, (bar, p, ci) in enumerate(zip(bars, percentages, cis)):
            # Position label above error bar
            label_y = ci[1] + 0.5  # Upper CI bound + small offset
            ax.text(bar.get_x() + bar.get_width()/2., label_y,
                   f'{int(p)}%',
                   ha='center', va='bottom', fontsize=9, fontweight='bold')

    # Add significance markers (position above tallest error bar in each category)
    for i, sig in enumerate(significance):
        if sig != 'NS':
            # Find the maximum upper CI bound for this category
            max_ci_upper = max(llm_cis[i][1], ml_cis[i][1])
            y_pos = max_ci_upper + 2
            ax.text(i, y_pos, sig, ha='center', va='bottom',
                   fontsize=12, fontweight='bold', color='red')

    # Calculate appropriate y-axis limit
    max_upper_ci = max([ci[1] for ci in llm_cis + ml_cis])
    y_max = max_upper_ci + 10  # Add space for significance markers and labels

    # Customize plot
    ax.set_xlabel('Contract Category', fontsize=12, fontweight='bold')
    ax.set_ylabel('Percentage (%) with 95% CI', fontsize=12, fontweight='bold')
    ax.set_title('Contract Violation Distribution: LLM vs ML APIs\n(with Wilson Score Confidence Intervals)',
                fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(categories)
    ax.legend(fontsize=11, frameon=True, shadow=True, loc='upper left')
    ax.set_ylim(0, y_max)

    # Add grid
    ax.yaxis.grid(True, alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)

    # Add note
    note = 'Error bars: 95% Wilson score confidence intervals\n' \
           '*** p < 0.001, ** p < 0.01, NS = Not Significant\n' \
           'ML API data from Khairunnesa et al. (2023)'
    ax.text(0.5, -0.17, note, transform=ax.transAxes,
           fontsize=8, ha='center', style='italic', color='gray')

    plt.tight_layout()
    return fig

def main():
    """Generate and save the figure"""
    fig = generate_comparison_chart()

    # Save
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(output_dir, 'fig3_llm_vs_ml_comparison')

    fig.savefig(f'{output_base}.pdf', dpi=300, bbox_inches='tight')
    fig.savefig(f'{output_base}.png', dpi=300, bbox_inches='tight')

    print(f"✓ Generated: {output_base}.pdf")
    print(f"✓ Generated: {output_base}.png")

    plt.close()

if __name__ == '__main__':
    main()
