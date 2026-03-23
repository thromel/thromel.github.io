#!/usr/bin/env python3
"""
Generate Figure 6: Impact of Contract Violations
A combination of pie chart and horizontal bar chart showing violation consequences
"""

import matplotlib.pyplot as plt
import pandas as pd
import os

# Set style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'Arial'
plt.rcParams['font.size'] = 10

def generate_impact_chart():
    """Generate violation impact visualization"""

    # Data from the paper
    impact_types = ['Immediate Exception', 'Silent Logic Error',
                   'Performance Degradation', 'Content Filtering']
    counts = [307, 214, 56, 35]
    percentages = [50.2, 35.0, 9.1, 5.7]

    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    # Left: Pie chart
    colors = ['#e74c3c', '#f39c12', '#3498db', '#9b59b6']
    explode = (0.05, 0.05, 0, 0)  # Emphasize the top two

    wedges, texts, autotexts = ax1.pie(percentages, labels=impact_types,
                                        colors=colors, autopct='%1.1f%%',
                                        startangle=90, explode=explode,
                                        wedgeprops=dict(edgecolor='black', linewidth=2),
                                        textprops=dict(fontsize=10, fontweight='bold'))

    # Make percentage text more readable
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(11)
        autotext.set_fontweight('bold')

    ax1.set_title('Distribution of Violation Impacts\n(n=612 total violations)',
                 fontsize=13, fontweight='bold', pad=20)

    # Right: Horizontal bar chart with counts
    y_pos = range(len(impact_types))
    bars = ax2.barh(y_pos, counts, color=colors, edgecolor='black', linewidth=1.5)

    # Add value labels
    for i, (bar, count, pct) in enumerate(zip(bars, counts, percentages)):
        width = bar.get_width()
        ax2.text(width + 5, bar.get_y() + bar.get_height()/2,
                f'{count} ({pct}%)',
                ha='left', va='center', fontsize=11, fontweight='bold')

    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(impact_types)
    ax2.set_xlabel('Number of Violations', fontsize=12, fontweight='bold')
    ax2.set_title('Violation Impact by Count',
                 fontsize=13, fontweight='bold', pad=15)
    ax2.xaxis.grid(True, alpha=0.3, linestyle='--')
    ax2.set_axisbelow(True)
    ax2.set_xlim(0, 350)

    # Add note about silent errors
    note = 'Critical: 35% of violations cause silent failures\nthat may go unnoticed until causing downstream problems'
    fig.text(0.5, 0.02, note, ha='center', fontsize=10,
            style='italic', color='red', weight='bold',
            bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.3))

    plt.tight_layout(rect=[0, 0.06, 1, 1])
    return fig

def main():
    """Generate and save the figure"""
    fig = generate_impact_chart()

    # Save
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(output_dir, 'fig6_violation_impact')

    fig.savefig(f'{output_base}.pdf', dpi=300, bbox_inches='tight')
    fig.savefig(f'{output_base}.png', dpi=300, bbox_inches='tight')

    print(f"✓ Generated: {output_base}.pdf")
    print(f"✓ Generated: {output_base}.png")

    plt.close()

if __name__ == '__main__':
    main()
