---
layout: showcase
show: true
width: 8
date: 2025-03-01 00:00:00 +0800
group: Research
title: StegFormer-MC Multi-Cover Image Steganography with Distributed Secret Embedding
excerpt: Extended the StegFormer architecture to hide secret images across multiple cover images, with innovative channel- and spatial-splitting strategies, parallel processing branches, and a composite loss function for robust training.
thumbnail: /assets/images/stegformer-mc.png
technologies:
  - Python
  - PyTorch
  - Deep Learning
  - Computer Vision
  - Steganography
---

## Research Collaborator | Ongoing Research | Image Steganography

<div class="text-end mb-3">
    <a href="https://github.com/thromel/StegFormer" target="_blank" class="btn btn-sm btn-outline-dark">
        <i class="fab fa-github"></i> View on GitHub
    </a>
</div>

## Lead Researcher | Ongoing Research Project

### Project Overview

An advanced steganography framework that extends the StegFormer architecture to distribute secret image data across multiple cover images, 
enhancing security and robustness against steganalysis detection methods while maintaining visual imperceptibility.

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

### Research Innovation

- **Distributed Embedding Strategy:** Novel approach to split secret data across multiple cover images using both channel-splitting and spatial-splitting techniques.
- **Enhanced Security:** Significantly reduced detectability by steganalysis algorithms by distributing the payload across multiple carriers.
- **Parallel Processing Branches:** Designed a multi-branch architecture that concurrently handles different cover images while maintaining embedding coherence.
- **Composite Loss Function:** Developed a specialized loss function balancing imperceptibility, robustness, and extraction accuracy.
- **Adversarial Training:** Incorporated adversarial components to improve resistance against neural steganalysis attacks.

### Technical Approach

1. **Secret Image Processing** – Decomposition of secret image into distributed segments with redundancy encoding for error resilience.
2. **Multi-Cover Embedding** – Parallel transformer-based embedding networks optimized for minimal perceptual distortion.
3. **Synergistic Extraction** – Advanced extraction network that synchronizes information from multiple stego images.
4. **Robustness Enhancement** – Implementation of noise layers to simulate real-world transmission conditions.
5. **Evaluation Framework** – Comprehensive evaluation against modern steganalysis techniques and under various attack scenarios.

### Preliminary Results

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

### Research Impact

This work advances the state-of-the-art in image steganography by introducing a multi-cover paradigm that significantly enhances security while maintaining high visual quality. The distributed embedding approach offers a promising direction for secure data hiding in adversarial environments.

### Future Directions

Extending the framework to handle video steganography, exploring adaptive payload distribution based on cover image characteristics, and developing cross-modal steganography techniques for embedding across different media types. 