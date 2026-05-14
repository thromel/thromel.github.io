---
layout: showcase
title: "Mini Deep Learning Framework: PyTorch from Scratch"
subtitle: "A freelance learning project for tensors, autograd, and neural-network internals"
category: projects
group: Freelance Learning Capstones
project_type: "Freelance learning project"
show: true
width: 8
date: 2025-12-15 00:00:00 +0600
excerpt: "A freelance learning project where I am rebuilding the basic parts of PyTorch: scalar values, tensors, autodiff, neural-network layers, convolutional operators, and simple training loops."
featured: true
showcase_style: learning-capstone
technologies:
  - Python
  - PyTorch
  - Autograd
  - Tensors
  - Neural Networks
  - Deep Learning
---

I am rebuilding a small PyTorch-like framework from first principles. The goal is simple: understand what happens before a deep-learning library gives you a clean API. How are values stored? How do operations form a graph? How do gradients move backward through that graph? How do small math functions become trainable neural-network layers?

I am listing it as a freelance learning project because it is a build I can show and improve over time. It also gives me better instincts for the AI systems work I care about. Tensors, gradients, and training loops are easier to reason about when I have implemented the messy parts myself.

## Capstone scope

The first milestone is scalar autodiff. Each value keeps track of the operation that produced it, so the program can walk backward from an output and compute gradients.

After that, the project moves from scalar values to tensors. This part covers shape handling, broadcasting, indexing, and the ordinary details that make array operations usable instead of painful.

The next step is a small neural-network layer system: linear layers, activation functions, losses, parameters, and a training loop. At that point the framework should be able to learn simple functions or classify a small dataset.

I also want to add convolution operators. That would make the project useful for image models and force me to deal with tensor layout and slow naive implementations.

Performance is part of the work, but I am keeping it honest. First I want the framework to be correct and readable. Then I can look at graph traversal, tensor layout, memory allocation, and the operations that should move toward vectorized or accelerated code.

## What I plan to ship

- A small framework with scalar autodiff, tensor operations, and neural-network modules.
- A few training examples that show the framework actually learns.
- Notes on the parts that were confusing or surprisingly easy to get wrong.
- Follow-up experiments for GPU kernels, transformer components, or inference optimization.

## Why I care

When I work on LLM systems, agents, or model evaluation, I do not want the model to be a black box all the way down. This project gives me a lower-level mental model for gradients, tensor operations, and the cost hidden behind clean APIs.
