#!/usr/bin/env python3
"""
Generate Figure 1: Contract Discovery Pipeline
A flowchart showing the 6-stage methodology
"""

from graphviz import Digraph
import os

def generate_methodology_pipeline():
    """Generate the methodology pipeline flowchart"""

    # Create a new directed graph
    dot = Digraph('methodology_pipeline', comment='Contract Discovery Pipeline')

    # Set graph attributes for better appearance
    dot.attr(rankdir='TB', size='8,10')
    dot.attr('node', shape='box', style='filled,rounded',
             fillcolor='lightblue', fontname='Arial', fontsize='11')
    dot.attr('edge', color='blue', penwidth='2', arrowsize='0.8')

    # Define nodes with stage information
    stages = [
        ('stage1', '1. Raw Sources\n10,000+ documents', 'Stack Overflow, GitHub,\nForums, Docs'),
        ('stage2', '2. Relevance Filtering\n2,500 relevant', 'LLM semantic\nfiltering'),
        ('stage3', '3. Contract Extraction\n623 instances', 'Pattern matching\n+ NLP'),
        ('stage4', '4. Classification &\nTaxonomy Development', 'Iterative\nrefinement'),
        ('stage5', '5. Validation\n94% accuracy', 'Inter-rater\nagreement'),
        ('stage6', '6. Analysis & Insights', 'Quantitative\nanalysis')
    ]

    # Add nodes
    for stage_id, stage_text, annotation in stages:
        dot.node(stage_id, stage_text)

    # Add edges between stages
    for i in range(len(stages) - 1):
        dot.edge(stages[i][0], stages[i+1][0])

    # Add annotation nodes
    dot.attr('node', shape='plaintext', fillcolor='none', fontsize='9',
             fontcolor='gray')
    for i, (stage_id, stage_text, annotation) in enumerate(stages):
        annotation_id = f'ann{i+1}'
        dot.node(annotation_id, annotation)
        dot.edge(stage_id, annotation_id, style='dashed', arrowhead='none',
                 color='gray')

    return dot

def main():
    """Generate and save the figure"""
    dot = generate_methodology_pipeline()

    # Save as PDF and PNG
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(output_dir, 'fig1_methodology_pipeline')

    dot.render(output_base, format='pdf', cleanup=True)
    dot.render(output_base, format='png', cleanup=True)

    print(f"✓ Generated: {output_base}.pdf")
    print(f"✓ Generated: {output_base}.png")

    # Also save the source
    with open(f"{output_base}.dot", 'w') as f:
        f.write(dot.source)
    print(f"✓ Generated: {output_base}.dot")

if __name__ == '__main__':
    main()
