---
show: true
width: 8
date: 2022-12-01 00:00:00 +0800
group: Projects
---

<div class="card-body p-4">
    <h2 class="card-title">Bangla Hand-Written Digit Recognition</h2>
    <h5 class="card-subtitle mb-3 text-muted">Author & Sole Engineer | 4-week Project | CSE-472 Coursework</h5>
    <hr/>
    
    <h4>Project Snapshot</h4>
    <p>
        An end-to-end OCR pipeline that classifies Bangla digits without relying on TensorFlow / PyTorch. 
        Every convolution, pooling, activation, back-prop step, and optimisation loop is implemented directly 
        in NumPy + OpenCV. The model delivers ≈ 95.9% test accuracy on the NumtaDB benchmark while remaining 
        fully transparent and hackable.
    </p>
    
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
                    <img src="{{ 'assets/images/projects/cnn-architecture.png' | relative_url }}" class="img-fluid mb-2" alt="CNN Architecture">
                    <small class="text-muted">Custom LeNet-style CNN architecture implemented in NumPy</small>
                </div>
            </div>
        </div>
    </div>
    
    <h4>Why It Matters</h4>
    <ul>
        <li><strong>Deep-dive into CNN internals:</strong> Coding forward & backward passes from scratch forced me to master tensor algebra, gradient flow, and He/Xavier initialisation instead of treating them as black boxes.</li>
        <li><strong>Research-style experimentation:</strong> Because the framework is minimal, I can instrument any tensor, inject custom loss terms, or prototype novel layers—an ability that transfers to cutting-edge model research.</li>
        <li><strong>Production-minded workflow:</strong> The finished artefacts include pickled weights, an inference CLI that produces CSV predictions, and CI-ready train/test scripts—proving the code can move beyond the classroom.</li>
    </ul>
    
    <h4>Pipeline Highlights</h4>
    <ol>
        <li><strong>Data Acquisition & Normalisation</strong> – Load NumtaDB, balance classes, apply per-pixel min–max scaling.</li>
        <li><strong>Aggressive Pre-processing</strong> – Grayscale, Otsu binarisation, morphological ops, auto-crop to digit ROI, final resize to 28 × 28.</li>
        <li><strong>Custom CNN (LeNet-style)</strong> – Conv→ReLU→Pool × 2 → Flatten → FC(120) → FC(84) → FC(10 Softmax) with both SGD and Adam variants.</li>
        <li><strong>Metrics & Visuals</strong> – Live plots for loss, val-accuracy, macro-F1; confusion-matrix inspection; two architecture diagrams included in the repo.</li>
        <li><strong>Model Export & Inference</strong> – Persist trained weights as cnn_model_1.pkl and expose a prediction script that batch-scores images and emits a competition-ready CSV.</li>
    </ol>
    
    <h4>Core Technologies</h4>
    <div class="mb-3">
        <span class="badge bg-primary me-1">Python 3.10</span>
        <span class="badge bg-primary me-1">NumPy</span>
        <span class="badge bg-primary me-1">OpenCV</span>
        <span class="badge bg-primary me-1">Matplotlib</span>
        <span class="badge bg-primary me-1">scikit-learn</span>
        <span class="badge bg-primary me-1">Custom CNN</span>
    </div>
    
    <h4>Outcomes</h4>
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
    
    <h4>Take-away</h4>
    <p>
        By stripping away high-level abstractions I proved I can reason about—and optimise—each numerical operation in a CNN. That granularity is invaluable when debugging model failures in production or extending architectures in research.
    </p>
    
    <h4>Next Steps</h4>
    <p>
        Port the pipeline to C++ for embedded deployment, and experiment with transformer-based vision layers to push accuracy beyond 97%.
    </p>
</div> 