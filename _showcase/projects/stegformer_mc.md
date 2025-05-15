---
show: true
width: 8
date: 2025-03-01 00:00:00 +0800
group: Research
---

<div class="card-body p-4">
    <h2 class="card-title">StegFormer-MC: Multi-Cover Image Steganography with Distributed Secret Embedding</h2>
    <h5 class="card-subtitle mb-3 text-muted">Lead Researcher | Ongoing Research Project</h5>
    <hr/>
    
    <h4>Project Overview</h4>
    <p>
        An advanced steganography framework that extends the StegFormer architecture to distribute secret image data across multiple cover images, 
        enhancing security and robustness against steganalysis detection methods while maintaining visual imperceptibility.
    </p>
    
    <div class="row mb-4">
        <div class="col-md-12">
            <div class="card mb-3">
                <div class="card-header bg-light">
                    <strong>StegFormer-MC Architecture</strong>
                </div>
                <div class="card-body text-center">
                    <img src="{{ 'assets/images/stegformer-mc-architecture.png' | relative_url }}" class="img-fluid mb-2" alt="StegFormer-MC Architecture">
                    <small class="text-muted">Multi-cover distributed embedding architecture with parallel processing branches</small>
                </div>
            </div>
        </div>
    </div>
    
    <h4>Research Innovation</h4>
    <ul>
        <li><strong>Distributed Embedding Strategy:</strong> Novel approach to split secret data across multiple cover images using both channel-splitting and spatial-splitting techniques.</li>
        <li><strong>Enhanced Security:</strong> Significantly reduced detectability by steganalysis algorithms by distributing the payload across multiple carriers.</li>
        <li><strong>Parallel Processing Branches:</strong> Designed a multi-branch architecture that concurrently handles different cover images while maintaining embedding coherence.</li>
        <li><strong>Composite Loss Function:</strong> Developed a specialized loss function balancing imperceptibility, robustness, and extraction accuracy.</li>
        <li><strong>Adversarial Training:</strong> Incorporated adversarial components to improve resistance against neural steganalysis attacks.</li>
    </ul>
    
    <h4>Technical Approach</h4>
    <ol>
        <li><strong>Secret Image Processing</strong> – Decomposition of secret image into distributed segments with redundancy encoding for error resilience.</li>
        <li><strong>Multi-Cover Embedding</strong> – Parallel transformer-based embedding networks optimized for minimal perceptual distortion.</li>
        <li><strong>Synergistic Extraction</strong> – Advanced extraction network that synchronizes information from multiple stego images.</li>
        <li><strong>Robustness Enhancement</strong> – Implementation of noise layers to simulate real-world transmission conditions.</li>
        <li><strong>Evaluation Framework</strong> – Comprehensive evaluation against modern steganalysis techniques and under various attack scenarios.</li>
    </ol>
    
    <h4>Core Technologies</h4>
    <div class="mb-3">
        <span class="badge bg-primary me-1">PyTorch</span>
        <span class="badge bg-primary me-1">Transformer Architecture</span>
        <span class="badge bg-primary me-1">Computer Vision</span>
        <span class="badge bg-primary me-1">Information Security</span>
        <span class="badge bg-primary me-1">Deep Learning</span>
        <span class="badge bg-primary me-1">Distributed Computing</span>
    </div>
    
    <h4>Preliminary Results</h4>
    <div class="table-responsive mb-3">
        <table class="table table-bordered">
            <thead class="table-light">
                <tr>
                    <th>Metric</th>
                    <th>Single-Cover</th>
                    <th>StegFormer-MC (Ours)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>PSNR (Cover)</td>
                    <td>36.2 dB</td>
                    <td>41.7 dB</td>
                </tr>
                <tr>
                    <td>Steganalysis Detection Rate</td>
                    <td>48.7%</td>
                    <td>22.3%</td>
                </tr>
                <tr>
                    <td>Secret Extraction Accuracy</td>
                    <td>92.1%</td>
                    <td>95.8%</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <h4>Research Impact</h4>
    <p>
        This work advances the state-of-the-art in image steganography by introducing a multi-cover paradigm that significantly enhances security while maintaining high visual quality. The distributed embedding approach offers a promising direction for secure data hiding in adversarial environments.
    </p>
    
    <h4>Future Directions</h4>
    <p>
        Extending the framework to handle video steganography, exploring adaptive payload distribution based on cover image characteristics, and developing cross-modal steganography techniques for embedding across different media types.
    </p>
</div> 