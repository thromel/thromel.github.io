#!/usr/bin/env python3
"""
Generate Figure 4: Contract Violations by Provider
A stacked bar chart showing violation distribution across providers
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

def generate_provider_chart():
    """Generate contract violations by provider chart with confidence intervals"""

    # Data from the paper
    providers = ['OpenAI\n(n=342)', 'Anthropic\n(n=31)', 'Google\n(n=22)',
                 'Azure\n(n=47)', 'Open-source\n(n=28)']
    sample_sizes = [342, 31, 22, 47, 28]
    data_type = [26, 32, 23, 28, 21]
    value = [38, 35, 41, 36, 46]
    output = [13, 10, 9, 15, 7]
    temporal = [19, 16, 23, 17, 21]
    hybrid = [4, 7, 4, 4, 5]

    # Create DataFrame
    df = pd.DataFrame({
        'Provider': providers,
        'Data Type': data_type,
        'Value': value,
        'Output': output,
        'Temporal': temporal,
        'Hybrid': hybrid
    })

    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    # Left plot: Stacked bar chart
    categories = ['Data Type', 'Value', 'Output', 'Temporal', 'Hybrid']
    colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']

    x = np.arange(len(providers))
    width = 0.6
    bottom = np.zeros(len(providers))

    for i, category in enumerate(categories):
        values = df[category].values
        ax1.bar(x, values, width, label=category, bottom=bottom,
               color=colors[i], edgecolor='black', linewidth=0.8)
        # Add percentage labels in the middle of each section
        for j, val in enumerate(values):
            if val > 5:  # Only show label if segment is large enough
                ax1.text(j, bottom[j] + val/2, f'{int(val)}%',
                        ha='center', va='center', fontsize=8, fontweight='bold',
                        color='white')
        bottom += values

    ax1.set_xlabel('Provider', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Percentage (%)', fontsize=12, fontweight='bold')
    ax1.set_title('Contract Violations by Provider (Stacked)',
                 fontsize=13, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(providers)
    ax1.legend(loc='upper left', bbox_to_anchor=(0, 1), fontsize=9)
    ax1.set_ylim(0, 100)
    ax1.yaxis.grid(True, alpha=0.3, linestyle='--')

    # Right plot: Grouped bar chart with error bars
    x2 = np.arange(len(categories))
    width2 = 0.15

    for i, provider in enumerate(providers):
        values = [df.iloc[i][cat] for cat in categories]
        n = sample_sizes[i]

        # Calculate confidence intervals for all values
        errors = []
        for val in values:
            lower, upper = wilson_interval(val, n)
            errors.append([val - lower, upper - val])
        errors = np.array(errors).T  # Shape: (2, num_categories)

        offset = (i - 2) * width2
        ax2.bar(x2 + offset, values, width2,
               yerr=errors,
               label=provider.split('\n')[0],
               edgecolor='black', linewidth=0.8,
               error_kw={'elinewidth': 1.5, 'capsize': 3, 'capthick': 1.5, 'alpha': 0.7})

    ax2.set_xlabel('Contract Category', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Percentage (%) with 95% CI', fontsize=12, fontweight='bold')
    ax2.set_title('Contract Violations by Category (Grouped)\nwith Wilson Score Confidence Intervals',
                 fontsize=12, fontweight='bold')
    ax2.set_xticks(x2)
    ax2.set_xticklabels(categories)
    ax2.legend(fontsize=9, loc='upper right')
    ax2.yaxis.grid(True, alpha=0.3, linestyle='--')
    ax2.set_ylim(0, 50)

    plt.tight_layout()
    return fig

def main():
    """Generate and save the figure"""
    fig = generate_provider_chart()

    # Save
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(output_dir, 'fig4_violations_by_provider')

    fig.savefig(f'{output_base}.pdf', dpi=300, bbox_inches='tight')
    fig.savefig(f'{output_base}.png', dpi=300, bbox_inches='tight')

    print(f"✓ Generated: {output_base}.pdf")
    print(f"✓ Generated: {output_base}.png")

    plt.close()

if __name__ == '__main__':
    main()
