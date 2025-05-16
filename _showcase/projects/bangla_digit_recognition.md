---
layout: showcase
show: true
width: 8
date: 2022-12-01 00:00:00 +0800
group: Projects
title: Bangla Hand-Written Digit Recognition
excerpt: An end-to-end OCR pipeline that classifies Bangla digits without relying on TensorFlow/PyTorch, implementing every CNN component from scratch in NumPy and achieving 95.9% accuracy on the NumtaDB benchmark.
technologies:
  - Python 3.10
  - NumPy
  - OpenCV
  - Matplotlib
  - scikit-learn
  - Custom CNN
---

## Author & Sole Engineer | 4-week Project | CSE-472 Coursework

<div class="text-end mb-3">
    <a href="https://github.com/thromel/CSE-472-Machine-Learning/tree/main/Offline%204" target="_blank" class="btn btn-sm btn-outline-dark">
        <i class="fab fa-github"></i> View on GitHub
    </a>
</div>

### Project Snapshot

An end-to-end OCR pipeline that classifies Bangla digits without relying on TensorFlow / PyTorch. 
Every convolution, pooling, activation, back-prop step, and optimisation loop is implemented directly 
in NumPy + OpenCV. The model delivers ≈ 95.9% test accuracy on the NumtaDB benchmark while remaining 
fully transparent and hackable.

<div class="row mb-4">
    <div class="col-md-6">
        <div class="card mb-3">
            <div class="card-header bg-light">
                <strong>Pipeline Diagram</strong>
            </div>
            <div class="card-body text-center">
                <img src="{{ 'assets/images/bangla-digit-recognition.png' | relative_url }}" class="img-fluid mb-2" alt="Pipeline Diagram">
                <small class="text-muted">Full OCR processing pipeline from raw images to classification</small>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card mb-3">
            <div class="card-header bg-light">
                <strong>CNN Architecture</strong>
            </div>
            <div class="card-body text-center">
                <img src="{{ 'assets/images/cnn-architecture.png' | relative_url }}" class="img-fluid mb-2" alt="CNN Architecture">
                <small class="text-muted">Custom LeNet-style CNN architecture implemented in NumPy</small>
            </div>
        </div>
    </div>
</div>

### Why It Matters

- **Deep-dive into CNN internals:** Coding forward & backward passes from scratch forced me to master tensor algebra, gradient flow, and He/Xavier initialisation instead of treating them as black boxes.
- **Research-style experimentation:** Because the framework is minimal, I can instrument any tensor, inject custom loss terms, or prototype novel layers—an ability that transfers to cutting-edge model research.
- **Production-minded workflow:** The finished artefacts include pickled weights, an inference CLI that produces CSV predictions, and CI-ready train/test scripts—proving the code can move beyond the classroom.

### Pipeline Highlights

1. **Data Acquisition & Normalisation** – Load NumtaDB, balance classes, apply per-pixel min–max scaling.
2. **Aggressive Pre-processing** – Grayscale, Otsu binarisation, morphological ops, auto-crop to digit ROI, final resize to 28 × 28.
3. **Custom CNN (LeNet-style)** – Conv→ReLU→Pool × 2 → Flatten → FC(120) → FC(84) → FC(10 Softmax) with both SGD and Adam variants.
4. **Metrics & Visuals** – Live plots for loss, val-accuracy, macro-F1; confusion-matrix inspection; two architecture diagrams included in the repo.
5. **Model Export & Inference** – Persist trained weights as cnn_model_1.pkl and expose a prediction script that batch-scores images and emits a competition-ready CSV.

### Outcomes

<div class="table-responsive mb-3">
    <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th>Metric</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Test accuracy</td>
                <td>95.9%</td>
            </tr>
            <tr>
                <td>Macro F1</td>
                <td>0.956</td>
            </tr>
            <tr>
                <td>Params</td>
                <td>44k</td>
            </tr>
        </tbody>
    </table>
</div>

### Take-away

By stripping away high-level abstractions I proved I can reason about—and optimise—each numerical operation in a CNN. That granularity is invaluable when debugging model failures in production or extending architectures in research.

### Next Steps

Port the pipeline to C++ for embedded deployment, and experiment with transformer-based vision layers to push accuracy beyond 97%. 