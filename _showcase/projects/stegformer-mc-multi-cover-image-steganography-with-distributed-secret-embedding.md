---
layout: showcase
title: "MC-StegFormer: Polynomial-Based Multiple Cover Steganography Using Transformer Architecture with Threshold Secret Sharing"
subtitle: "Novel Deep Learning Framework for Threshold-Based Multiple Cover Steganography"
date: 2025-03-01
category: research
group: Research
show: true
tags: [deep-learning, steganography, transformer, cryptography, threshold-secret-sharing, computer-vision, research]
technologies: [Python, PyTorch, Deep Learning, Computer Vision, Steganography, Cryptography]
github: "https://github.com/thromel/StegFormer"
demo: #
paper: #
status: "Ongoing Research"
featured: true
image: "/assets/images/stegformer-mc.png"
---

# MC-StegFormer: Polynomial-Based Multiple Cover Steganography Using Transformer Architecture with Threshold Secret Sharing

<div class="text-end mb-3">
    <a href="https://github.com/thromel/StegFormer" target="_blank" class="btn btn-sm btn-outline-dark">
        <i class="fab fa-github"></i> View on GitHub
    </a>
</div>

## Abstract

We present MC-StegFormer, a novel deep learning framework for multiple cover steganography that integrates transformer architecture with polynomial-based threshold secret sharing. Built upon the StegFormer architecture as our baseline, MC-StegFormer extends beyond traditional single-cover steganography methods that hide a secret image within one cover image. Instead, MC-StegFormer distributes secret information across multiple cover images using a (t,n)-threshold scheme, where any t out of n stego images can recover the original secret, but fewer than t images reveal no information.

Our approach introduces three key innovations: (1) a polynomial-based Threshold Redundancy Encoder (TRE) that generates cryptographically secure shares of the secret image using Shamir's secret sharing principles, (2) a shared cover encoder architecture with cover-specific adaptation layers that maintains consistent feature extraction while allowing individual cover customization, and (3) cross-cover attention mechanisms that enable information flow between different covers during the embedding process.

The framework achieves remarkable efficiency with only 694K parameters while maintaining high security and image quality. Experimental results on the DIV2K dataset demonstrate that MC-StegFormer successfully implements (3,2)-threshold steganography with a clear security gap of over 15 dB between authorized recovery (≥2 covers) and unauthorized attempts (<2 covers). The system maintains imperceptibility with average PSNR values exceeding 35 dB between cover and stego images.

Our ablation studies reveal that the polynomial-based secret sharing significantly outperforms simple splitting approaches, while the shared encoder architecture reduces parameters by 60% compared to independent encoders without sacrificing performance. The curriculum learning strategy, which gradually introduces threshold constraints during training, improves convergence speed by 40% and enhances the security gap by 3.2 dB.

MC-StegFormer represents a significant advancement in secure steganography, offering practical applications in distributed data hiding, secure multi-party communication, and robust information protection against partial data loss. The framework's modular design allows easy extension to different (t,n) configurations and integration with existing steganography systems.

## Key Contributions

1. **First transformer-based architecture** for threshold-based multiple cover steganography
2. **Polynomial secret sharing integration** ensuring cryptographic security properties
3. **Parameter-efficient design** with shared encoders and adaptive components
4. **Comprehensive evaluation framework** for threshold steganography systems
5. **Open-source implementation** with training pipelines and pre-trained models

## Keywords

Steganography, Threshold Secret Sharing, Transformer Architecture, Multiple Cover Steganography, Polynomial-based Encoding, Deep Learning, Information Hiding, Secure Communication

## Research Impact

This work bridges the gap between cryptographic secret sharing and neural steganography, demonstrating that deep learning models can successfully implement complex cryptographic primitives while maintaining practical efficiency. The threshold property ensures robustness against cover loss while preventing unauthorized access, making MC-StegFormer suitable for real-world secure communication applications where reliability and security are paramount.

The success of MC-StegFormer opens new research directions in neural cryptography, suggesting that other cryptographic protocols could be similarly enhanced through deep learning integration. Future work includes extending to larger threshold schemes, incorporating adversarial training for improved security, and exploring applications in video and audio steganography.

## Current Progress

**Status**: Currently experimenting with model architecture optimizations to increase performance even further. Active research focuses on:

- Enhanced attention mechanisms for improved cross-cover information sharing
- Advanced polynomial encoding strategies for better threshold security properties
- Optimization of the training pipeline for faster convergence and higher quality results
- Integration of additional robustness measures against advanced steganalysis attacks

Recent experiments show promising improvements in both security metrics and computational efficiency. Updates will be published as research progresses.

---

**Availability**: Code, pre-trained models, and datasets are available at: https://github.com/thromel/StegFormer

**Contact**: For questions and collaborations, please contact: [romel.rcs@gmail.com] 