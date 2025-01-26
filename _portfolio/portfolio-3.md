---
title: "AI-Powered Image Caption Generator"
excerpt: "Generate contextually accurate image descriptions using NLP and computer vision fusion<br/><img src='/images/image-caption.png'>"
collection: portfolio
---

[View Project on GitHub](https://github.com/thromel/image-captioning-bert)

**Objective**: Generate contextually accurate image descriptions using NLP and computer vision fusion.

## Tech Stack
* Python
* PyTorch
* Hugging Face Transformers (BERT)
* OpenCV
* CUDA for GPU acceleration

## Technical Innovations
* Combined **BERT embeddings** with **CNN visual features** for hybrid model training
* Implemented attention mechanisms for better feature extraction
* Reduced training time by 25% using mixed-precision training on GPUs
* Enhanced caption quality through transfer learning
* Achieved **BLEU-4 score of 0.62** on Flickr30k dataset

## Model Architecture
* **Visual Encoder**:
  * ResNet-based CNN for image feature extraction
  * Spatial attention mechanism
  * Feature pyramid network for multi-scale features

* **Language Model**:
  * BERT-based contextual embeddings
  * Transformer decoder with cross-attention
  * Beam search for caption generation

## Performance Metrics
* BLEU-4: 0.62
* METEOR: 0.38
* CIDEr: 1.21
* ROUGE-L: 0.58

## Key Features
* Multi-GPU training support
* Real-time inference capabilities
* Batch processing for multiple images
* REST API for easy integration
* Comprehensive evaluation metrics

## Applications
* Accessibility tools for visually impaired users
* Content management systems
* Social media platforms
* E-commerce product descriptions
* Educational materials

## Implementation Details
* Custom data loading pipeline
* Dynamic batching for efficient training
* Gradient accumulation for large models
* Automated evaluation pipeline
* Model checkpointing and versioning

## Future Enhancements
* Multi-language caption generation
* Style-controlled descriptions
* Video caption generation
* Fine-tuning on domain-specific datasets
* Model compression for mobile deployment 