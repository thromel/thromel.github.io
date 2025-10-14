# LLM API Contracts - Figure Generation

This directory contains Python scripts to generate all figures for the research paper "Contracts for Large Language Model APIs: A Comprehensive Taxonomy, Detection Framework, and Enforcement Strategies".

## Overview

**7 professional figures** are generated using Python visualization libraries (matplotlib, seaborn, graphviz):

1. **Figure 1**: Methodology Pipeline (Flowchart)
2. **Figure 2**: Contract Taxonomy (Hierarchical Tree)
3. **Figure 3**: LLM vs ML API Comparison (Bar Chart)
4. **Figure 4**: Violations by Provider (Stacked/Grouped Bars)
5. **Figure 5**: Violations by Framework (Pie Charts + Bars)
6. **Figure 6**: Violation Impact (Pie + Horizontal Bar)
7. **Figure 7**: Evolution Over Time (Line + Stacked Area)

## Quick Start

### Prerequisites

```bash
# Install required packages
pip install -r requirements.txt

# Or using conda
conda install matplotlib seaborn pandas numpy
pip install graphviz plotly kaleido
```

**Note**: You also need graphviz system package:
- macOS: `brew install graphviz`
- Ubuntu/Debian: `sudo apt-get install graphviz`
- Windows: Download from https://graphviz.org/download/

### Generate All Figures

```bash
# Make scripts executable
chmod +x *.py

# Run the master script to generate all figures
python3 generate_all_figures.py
```

This will generate PDF and PNG versions of all 7 figures.

### Generate Individual Figures

```bash
python3 generate_fig1_pipeline.py       # Methodology flowchart
python3 generate_fig2_taxonomy.py       # Taxonomy tree
python3 generate_fig3_comparison.py     # LLM vs ML comparison
python3 generate_fig4_providers.py      # Provider violations
python3 generate_fig5_frameworks.py     # Framework violations
python3 generate_fig6_impact.py         # Violation impact
python3 generate_fig7_evolution.py      # Temporal evolution
```

## Figure Details

### Figure 1: Methodology Pipeline
**File**: `fig1_methodology_pipeline.{pdf,png}`
**Type**: Flowchart (Graphviz)
**Purpose**: Visualizes the 6-stage contract discovery pipeline

Shows:
- 6 sequential stages from data collection to analysis
- Volume of documents at each stage (10,000 → 623)
- Techniques used at each stage

### Figure 2: Contract Taxonomy
**File**: `fig2_taxonomy_tree.{pdf,png}`
**Type**: Hierarchical Tree (Graphviz)
**Purpose**: Complete taxonomy with prevalence percentages

Shows:
- 3 main categories: SAM (78%), AMO (18%), Hybrid (4%)
- 8 subcategories
- 13 leaf categories
- Color-coded by hierarchy level

### Figure 3: LLM vs ML API Comparison
**File**: `fig3_llm_vs_ml_comparison.{pdf,png}`
**Type**: Grouped Bar Chart (Matplotlib/Seaborn)
**Purpose**: Compare contract violations between LLM and traditional ML APIs

Shows:
- 5 contract categories side-by-side
- Statistical significance markers (*** p < 0.001)
- Key finding: Output constraints much higher in LLM APIs (15% vs 2%)

### Figure 4: Violations by Provider
**File**: `fig4_violations_by_provider.{pdf,png}`
**Type**: Stacked + Grouped Bar Charts (Matplotlib/Seaborn)
**Purpose**: Provider-specific violation patterns

Shows:
- Left: Stacked bars showing full distribution per provider
- Right: Grouped bars comparing categories across providers
- 5 providers: OpenAI (n=342), Anthropic, Google, Azure, Open-source

### Figure 5: Violations by Framework
**File**: `fig5_violations_by_framework.{pdf,png}`
**Type**: Combined Pie Charts + Bar Charts (Matplotlib/Seaborn)
**Purpose**: Framework-level violation analysis

Shows:
- Top: Bar chart of most common violation by framework
- Middle: 3 pie charts showing detailed breakdowns
- Bottom: Grouped bar comparison across all categories
- 4 frameworks: LangChain, AutoGPT, Direct API, Custom

### Figure 6: Violation Impact
**File**: `fig6_violation_impact.{pdf,png}`
**Type**: Pie + Horizontal Bar Chart (Matplotlib/Seaborn)
**Purpose**: Consequences of contract violations

Shows:
- 4 impact types with counts and percentages
- Critical finding highlighted: 35% silent failures
- Color-coded by severity

### Figure 7: Evolution Over Time
**File**: `fig7_evolution_over_time.{pdf,png}`
**Type**: Line + Stacked Area + Table (Matplotlib/Seaborn)
**Purpose**: Temporal trends in contract violations

Shows:
- Top: Total violations over 4 time periods (2020-2024)
- Middle: Stacked area showing category breakdown
- Bottom: Table with dominant issues and new categories
- Annotations for key LLM releases (GPT-3, ChatGPT, GPT-4)

## Output Files

After running the generation scripts, you'll have:

```
figures/
├── fig1_methodology_pipeline.pdf
├── fig1_methodology_pipeline.png
├── fig1_methodology_pipeline.dot
├── fig2_taxonomy_tree.pdf
├── fig2_taxonomy_tree.png
├── fig2_taxonomy_tree.dot
├── fig3_llm_vs_ml_comparison.pdf
├── fig3_llm_vs_ml_comparison.png
├── fig4_violations_by_provider.pdf
├── fig4_violations_by_provider.png
├── fig5_violations_by_framework.pdf
├── fig5_violations_by_framework.png
├── fig6_violation_impact.pdf
├── fig6_violation_impact.png
├── fig7_evolution_over_time.pdf
└── fig7_evolution_over_time.png
```

## Using Figures in LaTeX

### Option 1: Include PDF directly

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.8\textwidth]{figures/fig1_methodology_pipeline.pdf}
\caption{Methodology for discovering and analyzing LLM API contracts}
\label{fig:methodology}
\end{figure}
```

### Option 2: Include PNG (if PDF has issues)

```latex
\usepackage{graphicx}

\begin{figure}[htbp]
\centering
\includegraphics[width=0.9\textwidth]{figures/fig3_llm_vs_ml_comparison.png}
\caption{Contract Violation Distribution: LLM vs ML APIs}
\label{fig:comparison}
\end{figure}
```

## Customization

Each script can be customized by editing:

### Colors
```python
# In any generate_fig*.py file
colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
```

### Sizes
```python
fig, ax = plt.subplots(figsize=(12, 8))  # Width, Height in inches
```

### Fonts
```python
plt.rcParams['font.family'] = 'Arial'
plt.rcParams['font.size'] = 10
```

### Resolution
```python
fig.savefig('output.png', dpi=300)  # 300 DPI for print quality
```

## Advantages of Python vs TikZ

✅ **Easier to modify data** - just change numbers in Python arrays
✅ **Better for complex visualizations** - pie charts, gradients, shadows
✅ **Consistent styling** - seaborn provides professional defaults
✅ **Multiple output formats** - PDF, PNG, SVG with one script
✅ **Reproducible** - version control friendly
✅ **Data-driven** - easy to load from CSV/JSON if needed

## Troubleshooting

### "graphviz not found" error
```bash
# Install system package
brew install graphviz  # macOS
sudo apt install graphviz  # Linux
```

### "ModuleNotFoundError"
```bash
# Install missing package
pip install matplotlib seaborn pandas graphviz
```

### Figures look different
- Check DPI setting (use 300 for print)
- Verify font availability on your system
- Try different output format (PDF vs PNG)

### Text overlap in Figure 2
- Increase `ranksep` and `nodesep` in taxonomy script
- Reduce font size for leaf nodes

## Data Sources

All data comes from the paper's empirical analysis:
- 612 contract violations from 10,000+ documents
- Stack Overflow, GitHub issues, official docs
- Coverage: OpenAI, Anthropic, Google, Azure, Open-source
- Time period: 2020-2024

## Dependencies

- **matplotlib** >= 3.7.0 - Core plotting
- **seaborn** >= 0.12.0 - Statistical visualizations
- **graphviz** >= 0.20.0 - Flowcharts and trees
- **pandas** >= 2.0.0 - Data manipulation
- **numpy** >= 1.24.0 - Numerical operations
- **plotly** >= 5.14.0 - (Optional) Interactive versions
- **kaleido** >= 0.2.1 - Plotly static export

## License

These scripts are part of the research paper and are provided for academic use.

## Citation

If you use these figures or scripts, please cite:

```bibtex
@article{romel2025llm,
  title={Contracts for Large Language Model APIs: A Comprehensive Taxonomy,
         Detection Framework, and Enforcement Strategies},
  author={Romel, Tanzim Hossain and Amin, Kazi Wasif and Mahmod, Istiak Bin and Rahman, Akond},
  year={2025}
}
```

## Contact

For questions or issues:
- **Author**: Tanzim Hossain Romel
- **Email**: romel.rcs@gmail.com
- **GitHub**: @thromel

---

**Last Updated**: January 2025
**Version**: 1.0.0
