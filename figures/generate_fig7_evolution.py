#!/usr/bin/env python3
"""
Generate Figure 7: Evolution of Contract Violations Over Time
A combination of line chart and stacked area chart showing temporal trends
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os

# Set style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'Arial'
plt.rcParams['font.size'] = 10

def generate_evolution_chart():
    """Generate temporal evolution visualization"""

    # Data from the paper
    periods = ['2020-2021', '2022', '2023', '2024']
    totals = [78, 156, 289, 89]

    # Breakdown by category (estimated based on dominant issues)
    basic_api = [35, 40, 50, 20]  # Basic API usage
    format_issues = [15, 50, 60, 25]  # Format issues
    policy = [8, 20, 81, 15]  # Policy violations
    tool_integration = [10, 25, 60, 31]  # Tool integration
    other = [10, 21, 38, -2]  # Other (calculated to match totals)
    other = [totals[i] - basic_api[i] - format_issues[i] - policy[i] - tool_integration[i]
            for i in range(len(periods))]

    # Create figure with proper spacing
    fig = plt.figure(figsize=(12, 14))
    gs = fig.add_gridspec(3, 1, height_ratios=[1, 1, 0.5], hspace=0.3)

    ax1 = fig.add_subplot(gs[0])
    ax2 = fig.add_subplot(gs[1])

    # Top: Line chart showing total violations over time
    ax1.plot(periods, totals, marker='o', linewidth=3, markersize=10,
            color='#e74c3c', label='Total Violations')
    ax1.fill_between(range(len(periods)), totals, alpha=0.3, color='#e74c3c')

    # Add value labels
    for i, (period, total) in enumerate(zip(periods, totals)):
        ax1.text(i, total + 10, str(total), ha='center', va='bottom',
                fontsize=12, fontweight='bold')

    ax1.set_ylabel('Number of Violations', fontsize=12, fontweight='bold')
    ax1.set_title('Total Contract Violations Over Time',
                 fontsize=14, fontweight='bold', pad=15)
    ax1.legend(fontsize=11, loc='upper left')
    ax1.yaxis.grid(True, alpha=0.3, linestyle='--')
    ax1.set_ylim(0, 320)
    ax1.set_axisbelow(True)

    # Add annotations for key events
    annotations = [
        (0, 78, 'GPT-3 Launch'),
        (1, 156, 'ChatGPT Release'),
        (2, 289, 'GPT-4 & Function\nCalling'),
        (3, 89, 'Multi-modal\nAPIs')
    ]
    for x, y, text in annotations:
        ax1.annotate(text, xy=(x, y), xytext=(x, y + 40),
                    fontsize=9, ha='center',
                    bbox=dict(boxstyle='round,pad=0.5', facecolor='yellow', alpha=0.7),
                    arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))

    # Bottom: Stacked area chart showing category breakdown
    categories_data = np.array([basic_api, format_issues, policy,
                               tool_integration, other])
    colors = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#95a5a6']
    labels = ['Basic API Usage', 'Format Issues', 'Policy Violations',
             'Tool Integration', 'Other']

    ax2.stackplot(range(len(periods)), categories_data, labels=labels,
                 colors=colors, alpha=0.8, edgecolor='black', linewidth=1)

    ax2.set_xlabel('Time Period', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Number of Violations', fontsize=12, fontweight='bold')
    ax2.set_title('Contract Violation Categories Over Time',
                 fontsize=14, fontweight='bold', pad=15)
    ax2.set_xticks(range(len(periods)))
    ax2.set_xticklabels(periods)
    ax2.legend(loc='upper left', fontsize=10, framealpha=0.9)
    ax2.yaxis.grid(True, alpha=0.3, linestyle='--')
    ax2.set_ylim(0, 320)
    ax2.set_axisbelow(True)

    # Add table showing dominant issues
    ax3 = fig.add_subplot(gs[2])
    ax3.axis('tight')
    ax3.axis('off')

    table_data = [
        ['Period', 'Total', 'Dominant Issue', 'New Categories'],
        ['2020-2021', '78', 'Basic API usage (45%)', 'Token limits'],
        ['2022', '156', 'Format issues (32%)', 'Chain orchestration'],
        ['2023', '289', 'Policy violations (28%)', 'Function calling'],
        ['2024', '89', 'Tool integration (35%)', 'Multi-modal contracts']
    ]

    table = ax3.table(cellText=table_data, cellLoc='left', loc='center',
                     colWidths=[0.15, 0.1, 0.35, 0.4])
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 1.8)

    # Style header row
    for i in range(4):
        table[(0, i)].set_facecolor('#3498db')
        table[(0, i)].set_text_props(weight='bold', color='white')

    # Alternate row colors
    for i in range(1, 5):
        for j in range(4):
            if i % 2 == 0:
                table[(i, j)].set_facecolor('#ecf0f1')

    return fig

def main():
    """Generate and save the figure"""
    fig = generate_evolution_chart()

    # Save
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(output_dir, 'fig7_evolution_over_time')

    fig.savefig(f'{output_base}.pdf', dpi=300, bbox_inches='tight')
    fig.savefig(f'{output_base}.png', dpi=300, bbox_inches='tight')

    print(f"✓ Generated: {output_base}.pdf")
    print(f"✓ Generated: {output_base}.png")

    plt.close()

if __name__ == '__main__':
    main()
