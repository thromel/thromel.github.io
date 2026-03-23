#!/usr/bin/env python3
"""
Generate Figure 2: LLM API Contract Taxonomy
A hierarchical tree diagram showing contract categories
"""

from graphviz import Digraph
import os

def generate_taxonomy_tree():
    """Generate the hierarchical taxonomy tree"""

    dot = Digraph('contract_taxonomy', comment='LLM API Contract Taxonomy')

    # Set graph attributes - increased size for expanded taxonomy
    dot.attr(rankdir='TB', size='16,14', ranksep='0.7', nodesep='0.4')

    # Root node
    dot.attr('node', shape='box', style='filled,rounded',
             fillcolor='#E6B3E6', fontname='Arial Bold', fontsize='12',
             penwidth='3', color='#8B008B')
    dot.node('root', 'LLM API\nContracts')

    # Level 1 - Main categories (updated percentages to account for new contracts)
    dot.attr('node', fillcolor='#B3D9FF', fontname='Arial Bold', fontsize='11',
             penwidth='2', color='#0066CC')
    dot.node('sam', 'Single API Method\n(SAM - 72%)')
    dot.node('amo', 'API Method Order\n(AMO - 22%)')
    dot.node('hybrid', 'Hybrid\n(H - 6%)')

    dot.edge('root', 'sam')
    dot.edge('root', 'amo')
    dot.edge('root', 'hybrid')

    # Level 2 - SAM subcategories (expanded)
    dot.attr('node', fillcolor='#B3FFB3', fontsize='10', penwidth='1.5',
             color='#006600')
    dot.node('dt', 'Data Type\n(26%)')
    dot.node('vc', 'Value\nConstraints\n(32%)')
    dot.node('oc', 'Output\nConstraints\n(9%)')
    dot.node('rag', 'RAG\nContracts\n(8%)')
    dot.node('cm', 'Compatibility\n& Modes\n(5%)')
    dot.node('mme', 'Multimodal\n& Encoding\n(3%)')

    dot.edge('sam', 'dt')
    dot.edge('sam', 'vc')
    dot.edge('sam', 'oc')
    dot.edge('sam', 'rag')
    dot.edge('sam', 'cm')
    dot.edge('sam', 'mme')

    # Level 3 - Data Type subcategories
    dot.attr('node', fillcolor='#FFE6B3', fontsize='9', penwidth='1',
             color='#CC6600')
    dot.node('pt', 'Primitive\n(7%)')
    dot.node('bit', 'Built-in\n(13%)')
    dot.node('st', 'Structured\n(8%)')

    dot.edge('dt', 'pt')
    dot.edge('dt', 'bit')
    dot.edge('dt', 'st')

    # Level 3 - Value Constraints subcategories
    dot.node('sp', 'Single\nParam\n(24%)')
    dot.node('mp', 'Multi-\nParam\n(11%)')

    dot.edge('vc', 'sp')
    dot.edge('vc', 'mp')

    # Level 3 - Output Constraints subcategories
    dot.node('fr', 'Format\nReq.\n(6%)')
    dot.node('pc', 'Policy\nComp.\n(4%)')

    dot.edge('oc', 'fr')
    dot.edge('oc', 'pc')

    # Level 3 - RAG Contracts subcategories (expanded)
    dot.node('rc', 'Retrieval\nContracts\n(5%)')
    dot.node('gc', 'Grounding\nContracts\n(3%)')

    dot.edge('rag', 'rc')
    dot.edge('rag', 'gc')

    # Level 4 - Retrieval Contracts details (expanded)
    dot.attr('node', fillcolor='#FFFACD', fontsize='8', penwidth='0.8',
             color='#8B8B00')
    dot.node('emb', 'Embedding/\nIndex Compat.\n(2%)')
    dot.node('topk', 'Top-k\nBounds\n(1.5%)')
    dot.node('fresh', 'Retrieval\nFreshness\n(1.5%)')

    dot.edge('rc', 'emb')
    dot.edge('rc', 'topk')
    dot.edge('rc', 'fresh')

    # Level 4 - Grounding Contracts details (expanded)
    dot.node('cite', 'Citation\nReq.\n(1.5%)')
    dot.node('hall', 'Hallucination\nGuards\n(1%)')
    dot.node('empty', 'Empty\nRetrieval\n(0.5%)')

    dot.edge('gc', 'cite')
    dot.edge('gc', 'hall')
    dot.edge('gc', 'empty')

    # Level 3 - Compatibility & Modes subcategories (NEW)
    dot.attr('node', fillcolor='#FFE6B3', fontsize='9', penwidth='1',
             color='#CC6600')
    dot.node('mvc', 'Model/Version\nCompatibility\n(2%)')
    dot.node('fme', 'Feature/Mode\nMutual Exclusion\n(1.5%)')
    dot.node('repro', 'Reproducibility\nContracts\n(1%)')
    dot.node('telem', 'Telemetry\nShape\n(0.5%)')

    dot.edge('cm', 'mvc')
    dot.edge('cm', 'fme')
    dot.edge('cm', 'repro')
    dot.edge('cm', 'telem')

    # Level 3 - Multimodal & Encoding subcategories (NEW)
    dot.node('mmpay', 'Multimodal\nPayload\n(2%)')
    dot.node('locale', 'Locale &\nEncoding\n(1%)')

    dot.edge('mme', 'mmpay')
    dot.edge('mme', 'locale')

    # Level 2 - AMO subcategories (expanded)
    dot.attr('node', fillcolor='#FFB3B3', fontsize='10', penwidth='1.5',
             color='#CC0000')
    dot.node('init', 'Initialization\n(7%)')
    dot.node('seq', 'Sequencing\n(6%)')
    dot.node('sm', 'State Mgmt\n(3%)')
    dot.node('sa', 'Streaming\n& Async\n(6%)')

    dot.edge('amo', 'init')
    dot.edge('amo', 'seq')
    dot.edge('amo', 'sm')
    dot.edge('amo', 'sa')

    # Level 3 - Streaming & Async subcategories (NEW)
    dot.attr('node', fillcolor='#FFE6B3', fontsize='9', penwidth='1',
             color='#CC6600')
    dot.node('sse', 'SSE\nSemantics\n(2.5%)')
    dot.node('async', 'Async Job\nLifecycle\n(2%)')
    dot.node('session', 'Session/Thread\nIdentity\n(1.5%)')

    dot.edge('sa', 'sse')
    dot.edge('sa', 'async')
    dot.edge('sa', 'session')

    # Level 2 - Hybrid subcategories (expanded)
    dot.attr('node', fillcolor='#D9B3FF', fontsize='10', penwidth='1.5',
             color='#6600CC')
    dot.node('cond', 'Conditional\n(2%)')
    dot.node('alt', 'Alternative\n(1%)')
    dot.node('tool', 'Tool\nContracts\n(2%)')
    dot.node('econ', 'Economic &\nGovernance\n(1%)')

    dot.edge('hybrid', 'cond')
    dot.edge('hybrid', 'alt')
    dot.edge('hybrid', 'tool')
    dot.edge('hybrid', 'econ')

    # Level 3 - Tool Contracts subcategories (NEW)
    dot.attr('node', fillcolor='#FFE6B3', fontsize='9', penwidth='1',
             color='#CC6600')
    dot.node('reg', 'Registry\nMembership\n(1%)')
    dot.node('budget', 'Call Budget\n& Loop Guard\n(1%)')

    dot.edge('tool', 'reg')
    dot.edge('tool', 'budget')

    # Level 3 - Economic & Governance subcategories (NEW)
    dot.node('slo', 'Budget/SLO\nContracts\n(0.5%)')
    dot.node('privacy', 'Data Gov.\n& Privacy\n(0.3%)')
    dot.node('idemp', 'Idempotency\n(0.2%)')

    dot.edge('econ', 'slo')
    dot.edge('econ', 'privacy')
    dot.edge('econ', 'idemp')

    return dot

def main():
    """Generate and save the figure"""
    dot = generate_taxonomy_tree()

    # Save as PDF and PNG
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(output_dir, 'fig2_taxonomy_tree')

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
