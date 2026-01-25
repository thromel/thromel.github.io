#!/usr/bin/env python3
"""
Master script to generate all figures for the LLM API Contracts paper
Runs all individual figure generation scripts
"""

import sys
import os
import subprocess

def run_script(script_name):
    """Run a Python script and return success status"""
    try:
        print(f"\n{'='*60}")
        print(f"Running: {script_name}")
        print('='*60)
        result = subprocess.run([sys.executable, script_name],
                              capture_output=False, text=True, check=True)
        print(f"✓ {script_name} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error running {script_name}")
        print(f"  Error: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error with {script_name}")
        print(f"  Error: {e}")
        return False

def main():
    """Generate all figures"""
    print("="*60)
    print("LLM API Contracts - Figure Generation Suite")
    print("="*60)

    # Get the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # List of all figure generation scripts
    scripts = [
        'generate_fig1_pipeline.py',
        'generate_fig2_taxonomy.py',
        'generate_fig3_comparison.py',
        'generate_fig4_providers.py',
        'generate_fig5_frameworks.py',
        'generate_fig6_impact.py',
        'generate_fig7_evolution.py'
    ]

    # Track results
    results = {}

    # Run each script
    for script in scripts:
        if os.path.exists(script):
            results[script] = run_script(script)
        else:
            print(f"✗ Script not found: {script}")
            results[script] = False

    # Print summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print('='*60)

    success_count = sum(results.values())
    total_count = len(scripts)

    for script, success in results.items():
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"{status}: {script}")

    print('='*60)
    print(f"Generated {success_count}/{total_count} figures successfully")
    print('='*60)

    # List generated files
    print("\nGenerated Files:")
    print("-" * 60)

    extensions = ['.pdf', '.png', '.dot']
    for ext in extensions:
        files = sorted([f for f in os.listdir(script_dir)
                       if f.startswith('fig') and f.endswith(ext)])
        if files:
            print(f"\n{ext.upper()} files:")
            for f in files:
                size = os.path.getsize(f) / 1024  # KB
                print(f"  • {f} ({size:.1f} KB)")

    return success_count == total_count

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
