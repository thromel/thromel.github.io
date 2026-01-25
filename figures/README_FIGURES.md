# LLM API Contracts - Figure Generation

This directory contains TikZ visualizations for the paper "Contracts for Large Language Model APIs".

## Generated Figures

### Figure 1: Contract Discovery Pipeline
- **File**: `fig1_methodology.tex`
- **Type**: Flowchart showing 6-stage methodology
- **Standalone**: `fig1_standalone.tex`

### Figure 2: LLM API Contract Taxonomy
- **File**: `fig2_taxonomy.tex`
- **Type**: Hierarchical tree diagram
- **Standalone**: `fig2_standalone.tex`

## Usage Instructions

### Option 1: Include in Main Document

Add these packages to your preamble:
```latex
\usepackage{tikz}
\usetikzlibrary{shapes,arrows,positioning,shadows,trees}
```

Then include the figures:
```latex
\begin{figure}[h]
\centering
\input{figures/fig1_methodology.tex}
\caption{Methodology for discovering and analyzing LLM API contracts}
\label{fig:methodology}
\end{figure}

\begin{figure}[h]
\centering
\input{figures/fig2_taxonomy.tex}
\caption{Hierarchical taxonomy of LLM API contracts with prevalence percentages}
\label{fig:taxonomy}
\end{figure}
```

### Option 2: Compile Standalone

To compile individual figures:
```bash
pdflatex fig1_standalone.tex
pdflatex fig2_standalone.tex
```

This generates PDF files that can be included as images:
```latex
\begin{figure}[h]
\centering
\includegraphics[width=0.8\textwidth]{figures/fig1_standalone.pdf}
\caption{Methodology for discovering and analyzing LLM API contracts}
\label{fig:methodology}
\end{figure}
```

### Option 3: Replace Placeholder in llm.tex

Find these sections in your llm.tex:

**For Figure 1** (around line 305-320):
Replace:
```latex
\begin{figure}[h]
\centering
\fbox{\parbox{0.9\textwidth}{
\textbf{Figure 1: Contract Discovery Pipeline}\\
\begin{enumerate}
\item Raw Sources (10,000+ documents)
...
\end{enumerate}
}}
\caption{Methodology for discovering and analyzing LLM API contracts}
\label{fig:methodology}
\end{figure}
```

With:
```latex
\begin{figure}[h]
\centering
\input{figures/fig1_methodology.tex}
\caption{Methodology for discovering and analyzing LLM API contracts}
\label{fig:methodology}
\end{figure}
```

**For Figure 2** (around line 570-609):
Replace the placeholder with:
```latex
\begin{figure}[h]
\centering
\input{figures/fig2_taxonomy.tex}
\caption{Hierarchical taxonomy of LLM API contracts with prevalence percentages}
\label{fig:taxonomy}
\end{figure}
```

## Customization

### Colors
Both figures use coordinated color schemes:
- **Figure 1**: Blue theme (modifiable in `box` style)
- **Figure 2**: Purple (root), Blue (L1), Green (L2), Orange (L3)

### Sizing
Adjust node sizes by modifying:
- `minimum width` and `minimum height` parameters
- `sibling distance` and `level distance` for tree spacing
- `node distance` for flowchart spacing

### Fonts
Current settings:
- Figure 1: `\small` for main text, `\small` for labels
- Figure 2: Scales from `\small\bfseries` (root) to `\tiny` (leaves)

## Dependencies

Required LaTeX packages:
```latex
\usepackage{tikz}
\usetikzlibrary{shapes,arrows,positioning,shadows,trees}
```

## Troubleshooting

### "Undefined control sequence" errors
- Ensure TikZ libraries are loaded
- Check that all packages are installed

### Spacing issues
- Adjust `sibling distance` and `level distance` in taxonomy
- Modify `node distance` in methodology flowchart

### Text overflow
- Reduce font sizes (`\tiny`, `\scriptsize`, `\footnotesize`)
- Increase `text width` parameter
- Use abbreviations

## File Structure

```
figures/
├── llm.tex                    # Main paper document
├── fig1_methodology.tex       # Figure 1 TikZ code
├── fig2_taxonomy.tex          # Figure 2 TikZ code
├── fig1_standalone.tex        # Standalone version of Figure 1
├── fig2_standalone.tex        # Standalone version of Figure 2
└── README_FIGURES.md          # This file
```

## Preview

To quickly preview the figures:
```bash
cd figures
pdflatex fig1_standalone.tex && open fig1_standalone.pdf
pdflatex fig2_standalone.tex && open fig2_standalone.pdf
```

On Linux, replace `open` with `xdg-open` or `evince`.
