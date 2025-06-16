#!/bin/bash

# Compile CV LaTeX to PDF
echo "Compiling CV..."

# Check if pdflatex is installed
if ! command -v pdflatex &> /dev/null; then
    echo "pdflatex not found. Please install a LaTeX distribution."
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p assets/pdf

# Compile the CV
cd _posts
pdflatex -interaction=nonstopmode cv.tex
pdflatex -interaction=nonstopmode cv.tex  # Run twice for references

# Move PDF to assets
if [ -f cv.pdf ]; then
    mv cv.pdf ../assets/pdf/
    echo "CV compiled successfully! PDF saved to assets/pdf/cv.pdf"
    
    # Clean up auxiliary files
    rm -f cv.aux cv.log cv.out
else
    echo "Failed to compile CV"
    exit 1
fi