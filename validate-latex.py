#!/usr/bin/env python3
"""
LaTeX validation script to check for common syntax errors
"""
import re
import sys

def validate_latex(filename):
    """Check for common LaTeX errors"""
    errors = []
    line_num = 0
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    # Check for matching braces
    brace_count = 0
    for i, line in enumerate(lines, 1):
        for char in line:
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count < 0:
                    errors.append(f"Line {i}: Unmatched closing brace")
    
    if brace_count > 0:
        errors.append(f"Document has {brace_count} unmatched opening braces")
    elif brace_count < 0:
        errors.append(f"Document has {abs(brace_count)} extra closing braces")
    
    # Check for common environment mismatches
    environments = {}
    for i, line in enumerate(lines, 1):
        # Find \begin{env}
        begin_match = re.search(r'\\begin\{([^}]+)\}', line)
        if begin_match:
            env_name = begin_match.group(1)
            if env_name not in environments:
                environments[env_name] = []
            environments[env_name].append(('begin', i))
        
        # Find \end{env}
        end_match = re.search(r'\\end\{([^}]+)\}', line)
        if end_match:
            env_name = end_match.group(1)
            if env_name not in environments:
                environments[env_name] = []
            environments[env_name].append(('end', i))
    
    # Check environment matching
    for env_name, occurrences in environments.items():
        begin_count = sum(1 for action, _ in occurrences if action == 'begin')
        end_count = sum(1 for action, _ in occurrences if action == 'end')
        
        if begin_count != end_count:
            errors.append(f"Environment '{env_name}': {begin_count} \\begin but {end_count} \\end")
        
        # Check order
        stack = []
        for action, line_num in occurrences:
            if action == 'begin':
                stack.append(line_num)
            elif action == 'end':
                if not stack:
                    errors.append(f"Line {line_num}: \\end{{{env_name}}} without matching \\begin")
                else:
                    stack.pop()
        
        if stack:
            for line_num in stack:
                errors.append(f"Line {line_num}: \\begin{{{env_name}}} without matching \\end")
    
    # Check for specific issues
    for i, line in enumerate(lines, 1):
        # Check for common typos
        if r'\end{onecolentry>' in line:
            errors.append(f"Line {i}: Invalid command '\\end{{onecolentry>}}' - should be '\\end{{onecolentry}}'")
        
        # Check for unescaped special characters in text (skip comments)
        if not line.strip().startswith('%') and '\\%' not in line:
            # Look for % that's not part of a comment
            comment_pos = line.find('%')
            if comment_pos > 0 and line[comment_pos-1] != '\\':
                # Check if it's actually a comment or unescaped %
                before_percent = line[:comment_pos].strip()
                if before_percent and not before_percent.endswith('\\'):
                    # This might be an unescaped % in the middle of text
                    pass  # Skip this check for now as it's too aggressive
    
    return errors

def main():
    if len(sys.argv) != 2:
        print("Usage: python validate-latex.py <filename.tex>")
        sys.exit(1)
    
    filename = sys.argv[1]
    errors = validate_latex(filename)
    
    if errors:
        print("LaTeX validation errors found:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("No LaTeX validation errors found!")
        sys.exit(0)

if __name__ == "__main__":
    main()