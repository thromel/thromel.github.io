#!/usr/bin/env python3
"""
Generate Figure 5: Contract Violations by Framework
A combination of pie charts and bar chart showing framework-specific patterns
"""

import matplotlib.pyplot as plt
import pandas as pd
import os

# Set style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'Arial'
plt.rcParams['font.size'] = 10

def generate_framework_chart():
    """Generate contract violations by framework chart"""

    # Create figure with subplots
    fig = plt.figure(figsize=(14, 10))
    gs = fig.add_gridspec(3, 3, hspace=0.4, wspace=0.4)

    # Main bar chart showing most common violation by framework
    ax_main = fig.add_subplot(gs[0, :])

    frameworks = ['LangChain', 'AutoGPT', 'Direct API', 'Custom']
    n_instances = [89, 23, 420, 80]
    most_common = ['Output Format', 'Output Format', 'Value Constraints', 'Data Type']
    percentages = [45, 52, 40, 38]

    colors_map = {
        'Output Format': '#e74c3c',
        'Value Constraints': '#2ecc71',
        'Data Type': '#3498db'
    }
    bar_colors = [colors_map[mc] for mc in most_common]

    bars = ax_main.bar(frameworks, percentages, color=bar_colors,
                       edgecolor='black', linewidth=1.5, alpha=0.8)

    # Add value labels
    for i, (bar, pct, n) in enumerate(zip(bars, percentages, n_instances)):
        height = bar.get_height()
        ax_main.text(bar.get_x() + bar.get_width()/2., height,
                    f'{pct}%\n(n={n})',
                    ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax_main.set_ylabel('Percentage of Most Common Violation', fontsize=11, fontweight='bold')
    ax_main.set_title('Most Common Contract Violation by Framework',
                     fontsize=13, fontweight='bold', pad=15)
    ax_main.set_ylim(0, 60)
    ax_main.yaxis.grid(True, alpha=0.3, linestyle='--')
    ax_main.set_axisbelow(True)

    # Add legend for violation types
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#e74c3c', edgecolor='black', label='Output Format'),
        Patch(facecolor='#2ecc71', edgecolor='black', label='Value Constraints'),
        Patch(facecolor='#3498db', edgecolor='black', label='Data Type')
    ]
    ax_main.legend(handles=legend_elements, loc='upper right', fontsize=9)

    # Pie charts for detailed breakdown
    # LangChain breakdown
    ax1 = fig.add_subplot(gs[1, 0])
    langchain_data = [45, 23, 20, 12]
    langchain_labels = ['Output Format\n45%', 'Data Type\n23%',
                        'Temporal\n20%', 'Other\n12%']
    colors1 = ['#e74c3c', '#3498db', '#f39c12', '#95a5a6']
    ax1.pie(langchain_data, labels=langchain_labels, colors=colors1,
           autopct='', startangle=90, wedgeprops=dict(edgecolor='black', linewidth=1.5))
    ax1.set_title('LangChain (n=89)', fontsize=11, fontweight='bold')

    # AutoGPT breakdown
    ax2 = fig.add_subplot(gs[1, 1])
    autogpt_data = [52, 26, 22]
    autogpt_labels = ['Output Format\n52%', 'Temporal\n26%', 'Value Const.\n22%']
    colors2 = ['#e74c3c', '#f39c12', '#2ecc71']
    ax2.pie(autogpt_data, labels=autogpt_labels, colors=colors2,
           autopct='', startangle=90, wedgeprops=dict(edgecolor='black', linewidth=1.5))
    ax2.set_title('AutoGPT (n=23)', fontsize=11, fontweight='bold')

    # Direct API breakdown
    ax3 = fig.add_subplot(gs[1, 2])
    direct_data = [40, 30, 20, 10]
    direct_labels = ['Value Const.\n40%', 'Data Type\n30%',
                    'Temporal\n20%', 'Output\n10%']
    colors3 = ['#2ecc71', '#3498db', '#f39c12', '#e74c3c']
    ax3.pie(direct_data, labels=direct_labels, colors=colors3,
           autopct='', startangle=90, wedgeprops=dict(edgecolor='black', linewidth=1.5))
    ax3.set_title('Direct API (n=420)', fontsize=11, fontweight='bold')

    # Comparison bar chart at bottom
    ax_bottom = fig.add_subplot(gs[2, :])

    categories = ['Output Format', 'Data Type', 'Value Const.', 'Temporal', 'Other']
    langchain_breakdown = [45, 23, 0, 20, 12]
    autogpt_breakdown = [52, 0, 22, 26, 0]
    direct_breakdown = [10, 30, 40, 20, 0]
    custom_breakdown = [0, 38, 25, 20, 17]

    x = range(len(categories))
    width = 0.2

    ax_bottom.bar([i - 1.5*width for i in x], langchain_breakdown, width,
                  label='LangChain', color='#3498db', edgecolor='black')
    ax_bottom.bar([i - 0.5*width for i in x], autogpt_breakdown, width,
                  label='AutoGPT', color='#e74c3c', edgecolor='black')
    ax_bottom.bar([i + 0.5*width for i in x], direct_breakdown, width,
                  label='Direct API', color='#2ecc71', edgecolor='black')
    ax_bottom.bar([i + 1.5*width for i in x], custom_breakdown, width,
                  label='Custom', color='#f39c12', edgecolor='black')

    ax_bottom.set_xlabel('Violation Category', fontsize=11, fontweight='bold')
    ax_bottom.set_ylabel('Percentage (%)', fontsize=11, fontweight='bold')
    ax_bottom.set_title('Detailed Breakdown by Framework and Category',
                       fontsize=12, fontweight='bold')
    ax_bottom.set_xticks(x)
    ax_bottom.set_xticklabels(categories)
    ax_bottom.legend(fontsize=9, ncol=4, loc='upper right')
    ax_bottom.yaxis.grid(True, alpha=0.3, linestyle='--')
    ax_bottom.set_axisbelow(True)
    ax_bottom.set_ylim(0, 60)

    return fig

def main():
    """Generate and save the figure"""
    fig = generate_framework_chart()

    # Save
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(output_dir, 'fig5_violations_by_framework')

    fig.savefig(f'{output_base}.pdf', dpi=300, bbox_inches='tight')
    fig.savefig(f'{output_base}.png', dpi=300, bbox_inches='tight')

    print(f"✓ Generated: {output_base}.pdf")
    print(f"✓ Generated: {output_base}.png")

    plt.close()

if __name__ == '__main__':
    main()
