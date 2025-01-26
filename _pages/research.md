---
layout: archive
title: "Research Projects"
permalink: /research/
author_profile: true
---

{% include base_path %}

My research interests lie at the intersection of distributed systems, software engineering, and artificial intelligence. Here are some of my key research projects and contributions:

## Current Research

### LLM Library Contracts
* Investigating contracts and best practices for LLM libraries
* Developing taxonomy for LLM-specific usage guidelines
* Studying impact on distributed systems and software engineering
* [Learn more](/research/llm-contracts)

### Healthcare Blockchain Systems
* Secure patient data management using blockchain
* HIPAA-compliant decentralized architecture
* Smart contract-based access control
* [Learn more](/research/healthcare-blockchain)

## Past Research

### TCP Vegas+ Protocol
* Enhanced fairness in wireless networks
* NS3-based simulation and analysis
* Performance optimization for MANETs
* [Learn more](/research/tcp-vegas)

### Bangla Handwritten Digit Recognition
* Deep learning for South Asian scripts
* Custom CNN architecture
* 95.87% accuracy on NumtaDB dataset
* [Learn more](/research/bangla-ocr)

## Research Posts

{% for post in site.research reversed %}
  {% include archive-single.html %}
{% endfor %} 