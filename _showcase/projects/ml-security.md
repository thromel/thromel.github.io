---
layout: Research
title: "Securing Machine Learning Model Ecosystems: A Comprehensive Security Analysis"
subtitle: "Comprehensive Security Analysis of ML Model Hubs and RCE Vulnerabilities"
date: 2025-05-25
category: research
tags: [machine-learning, security, vulnerability-analysis, model-hubs, research]
technologies: [Python, Security Analysis, Vulnerability Assessment, ML Security, Code Analysis]
github: #
demo: #
paper: #
status: "Ongoing Research"
featured: true
image: "/assets/images/projects/ml-security-banner.png"
---

# Securing Machine Learning Model Ecosystems: A Comprehensive Security Analysis

<div class="alert alert-info" role="alert">
  <i class="fas fa-info-circle"></i> <strong>Current Research Project:</strong> This research is ongoing and represents a comprehensive investigation into machine learning model hub security vulnerabilities.
</div>

## Collaboration

<div class="alert alert-success" role="alert">
  <i class="fas fa-users"></i> <strong>Research Collaboration:</strong> Since January 2025, this project is being conducted in collaboration with <a href="https://lsiddiqsunny.github.io" target="_blank"><strong>Mohammad Latif Siddique</strong></a>, Ph.D. candidate at University of Notre Dame, USA. Mohammad specializes in software engineering, software security, code generation, and applied machine learning, and is currently a Ph.D. intern at Meta (Summer 2025) working with WhatsApp Core Consumer Messaging Groups & Communities on LLM applications.
</div>

## Abstract

Machine learning model hubs have become critical infrastructure for AI development, hosting millions of pre-trained models that power modern AI applications. However, recent research has revealed that these platforms face significant security challenges, particularly related to remote code execution (RCE) vulnerabilities. This ongoing research project conducts a comprehensive security analysis of 15 major ML platforms, building upon the foundational work of Zhao et al. (2024) and expanding the understanding of ML ecosystem security threats.

## Research Overview

This investigation represents a systematic examination of the machine learning model supply chain security, treating ML models as executable code rather than mere data files—a paradigm shift that fundamentally changes how we approach ML security. The research encompasses industry leaders like **Hugging Face Hub** (752,000+ models), **Kaggle** (355,000+ datasets), **TensorFlow Hub**, and **PyTorch Hub**, as well as emerging platforms across different geographical regions.

### Key Research Questions

1. **Security Maturity Assessment**: How do different ML platforms compare in their security implementations?
2. **Vulnerability Classification**: What are the primary attack vectors in modern ML model ecosystems?
3. **Defensive Mechanisms**: Which security technologies effectively mitigate RCE risks?
4. **Supply Chain Security**: How can we establish secure practices for ML model distribution?

## Methodology & Scope

The research methodology employs a multi-phase approach:

### Phase 1: Platform Analysis
- **Comprehensive Coverage**: 15 major ML platforms across different ecosystems
- **Security Framework Assessment**: Evaluation using established security analysis frameworks
- **Vulnerability Discovery**: Systematic identification of potential attack vectors

### Phase 2: Threat Modeling
- **Attack Vector Analysis**: Classification of RCE vulnerabilities in ML contexts
- **Real-world Case Studies**: Analysis of actual security incidents (JFrog's 100+ malicious models, ReversingLabs' "NullifAI" attacks)
- **Platform Comparison**: Detailed security maturity assessment

### Phase 3: Defensive Technology Evaluation
- **SafeTensors Analysis**: Evaluation of secure serialization formats
- **Scanning Pipeline Assessment**: Analysis of automated detection systems like MalHug framework
- **Runtime Protection**: eBPF monitoring, container sandboxing, and cryptographic signing

## Key Findings

### Security Landscape Overview

The research reveals significant security maturity variations across platforms:

**Advanced Security Platforms** (e.g., Hugging Face):
- Multi-layered defense systems
- ClamAV antivirus scanning
- PickleScan for malicious pickle detection
- TruffleHog for secret detection
- Partnership with Protect AI's Guardian technology
- "Zero trust" approach implementation

**Basic Security Platforms** (e.g., PyTorch Hub):
- Minimal protective measures
- User-responsibility security model
- Limited automated scanning
- Basic policy enforcement

### Critical Vulnerability Patterns

**Serialization Vulnerabilities**:
- Over 55% of models use potentially vulnerable formats
- Python pickle format enables arbitrary code execution
- Legacy serialization methods lack security controls

**Recent CVE Discoveries**:
- **CVE-2025-1550**: Keras Lambda layer code execution in "safe mode"
- **CVE-2024-27132**: MLflow YAML recipe injection leading to RCE
- Framework-level vulnerabilities extending beyond model files

### Innovative Security Solutions

**SafeTensors Technology**:
- Pure tensor data storage without code execution capability
- Physical elimination of deserialization attacks
- Backward compatibility with existing ML workflows

**Advanced Detection Systems**:
- **MalHug Framework**: 91 malicious models detected across 705,000+ models
- Static analysis combined with taint tracking
- Automated threat identification and classification

## Technical Innovation

### Security Maturity Framework

The research develops a comprehensive assessment matrix categorizing platforms from "Basic" to "Advanced" based on:

- **Automated Scanning**: Virus detection, pickle analysis, secret scanning
- **Access Controls**: Authentication, authorization, rate limiting
- **Content Validation**: Model verification, signature checking
- **Incident Response**: Threat detection, automated remediation
- **Community Safety**: Reporting mechanisms, moderation systems

### Runtime Security Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Model Upload  │───▶│  Security Scanner │───▶│  Safe Storage   │
│   & Validation  │    │     Pipeline      │    │   & Delivery    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ eBPF Monitoring │    │  Container       │    │ Cryptographic   │
│ & Threat        │    │  Sandboxing      │    │ Verification    │
│ Detection       │    │  & Isolation     │    │ & Signing       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Industry Impact & Real-World Applications

### Case Studies Analysis

**Hugging Face Evolution** (2021-2025):
- Progression from minimal security to comprehensive "zero trust" approach
- 4.47 million model versions scanned by April 2025
- Tens of thousands of security issues flagged and resolved

**Attack Sophistication Trends**:
- Evolution from simple malicious uploads to sophisticated bypass techniques
- "NullifAI" attacks successfully evading security scanners
- Supply chain compromise through dependency injection

### Platform Security Recommendations

1. **Mandatory Security Scanning**: Implement multi-layer automated analysis
2. **Secure Serialization**: Transition to SafeTensors or equivalent secure formats
3. **Runtime Isolation**: Deploy container-based sandboxing for model execution
4. **Cryptographic Verification**: Establish model signing and verification workflows
5. **Community Governance**: Implement robust reporting and moderation systems

## Future Research Directions

### Emerging Threats
- **AI-Generated Malware**: Models trained to generate malicious code
- **Model Poisoning**: Subtle backdoors in seemingly legitimate models
- **Supply Chain Attacks**: Compromise through dependencies and infrastructure

### Defensive Innovation
- **Zero-Trust Model Execution**: Assumption of model maliciousness by default
- **Behavioral Analysis**: Runtime monitoring of model behavior patterns
- **Federated Security**: Collaborative threat intelligence across platforms

### Standardization Efforts
- **Industry Security Standards**: Establishment of ML security best practices
- **Compliance Frameworks**: Integration with existing cybersecurity regulations
- **Certification Programs**: Security validation for ML model publishers

## Research Impact & Contributions

This research provides:

1. **Comprehensive Security Assessment**: First systematic analysis of ML platform security across 15 major hubs
2. **Practical Security Framework**: Actionable recommendations for platform operators
3. **Threat Intelligence**: Detailed analysis of real-world attack patterns
4. **Defensive Technology Evaluation**: Assessment of current and emerging security solutions

The findings directly inform:
- **Platform Security Policies**: Evidence-based security implementations
- **Developer Best Practices**: Secure model development and distribution guidelines
- **Risk Assessment Frameworks**: Quantitative security evaluation methodologies
- **Industry Standards**: Contribution to emerging ML security standards

## Conclusion

This ongoing research represents a crucial step toward securing the foundation of modern AI development. As machine learning models become increasingly integrated into critical infrastructure and decision-making processes, understanding and mitigating security risks in the ML supply chain becomes paramount.

The comprehensive security maturity matrix and defensive recommendations developed through this research serve as both an assessment tool for current platforms and a roadmap for emerging hubs seeking to implement robust security measures from inception.

By treating machine learning models as part of the software supply chain—with all associated security considerations—this work provides essential groundwork for establishing industry standards and best practices in an era where AI systems are becoming ubiquitous in society.

---

## References

<div class="references-section">
<ol class="references-list">
  <li>Zhao, H., Chen, H., Yang, F., et al. (2024). "Models Are Codes: Towards Measuring Malicious Code Poisoning Attacks on Pre-trained Model Hubs." <em>arXiv:2409.09368</em>. <a href="https://arxiv.org/abs/2409.09368" target="_blank">Link</a></li>
  
  <li>JFrog Security Research Team. (2023). "Machine Learning Security: Malicious Models on Hugging Face." <a href="https://www.businesswire.com/news/home/20250304244002/en/JFrog-and-Hugging-Face-Team-to-Improve-Machine-Learning-Security-and-Transparency-for-Developers" target="_blank">Link</a></li>
  
  <li>ReversingLabs. (2024). "NullifAI: Novel Attack Techniques Bypassing ML Security Scanners." Referenced in: <a href="https://www.darkreading.com/cyber-risk/open-source-ai-models-pose-risks-of-malicious-code-vulnerabilities" target="_blank">Dark Reading</a></li>
  
  <li>Hugging Face. (2024). "2024 Security Feature Highlights." <em>Hugging Face Blog</em>. <a href="https://huggingface.co/blog/2024-security-features" target="_blank">Link</a></li>
  
  <li>Hugging Face & Protect AI. (2025). "4M Models Scanned: Protect AI + Hugging Face 6 Months In." <em>Hugging Face Blog</em>. <a href="https://huggingface.co/blog/pai-6-month" target="_blank">Link</a></li>
  
  <li>MIT Cybersecurity Research. (2024). "Hugging Face AI Platform Riddled With 100 Malicious Code Execution Models." <a href="https://cyberir.mit.edu/site/hugging-face-ai-platform-riddled-100-malicious-code-execution-models/" target="_blank">Link</a></li>
  
  <li>PyTorch Team. (2024). "Security Policy." <em>PyTorch GitHub Repository</em>. <a href="https://github.com/pytorch/pytorch/security/policy" target="_blank">Link</a></li>
  
  <li>MITRE Corporation. (2025). "CVE-2025-1550: Keras Lambda Layer Code Execution Vulnerability."</li>
  
  <li>MITRE Corporation. (2024). "CVE-2024-27132: MLflow YAML Recipe Injection Leading to RCE."</li>
  
  <li>Hugging Face. (2022). "SafeTensors: A New Simple Format for Storing Tensors Safely." <em>Hugging Face Documentation</em>.</li>
  
  <li>Davis, J. (2024). "An Empirical Study of Artifacts and Security Risks in the Pre-trained Model Supply Chain." <em>Medium</em>. <a href="https://davisjam.medium.com/an-empirical-study-of-artifacts-and-security-risks-in-the-pre-trained-model-supply-chain-2c75fd99942b" target="_blank">Link</a></li>
  
  <li>Forbes Security Coverage. (2024). "Hackers Have Uploaded Thousands Of Malicious Files To AI's Biggest Online Repository." <a href="https://www.forbes.com/sites/iainmartin/2024/10/22/hackers-have-uploaded-thousands-of-malicious-models-to-ais-biggest-online-repository/" target="_blank">Link</a></li>
</ol>
</div>

### Additional Platform References

- **OpenCSG Documentation**: [Model Hub Introduction](https://opencsg.com/docs/en/model/model_hub_intro)
- **WiseModel Platform**: [ToolACE-8B Model](https://wisemodel.cn/models/XuHwang/ToolACE-8B)
- **John Snow Labs Model Hub**: [Platform Overview](https://modelshub.johnsnowlabs.com/)
- **NVIDIA NGC User Guide**: [Documentation](https://docs.nvidia.com/ngc/gpu-cloud/ngc-user-guide/index.html)
- **MindSpore Security**: [Model Security Tutorial](https://www.mindspore.cn/tutorial/en/0.1.0-alpha/advanced_use/model_security.html)
- **Kaggle Security Discussion**: [Community Discussion](https://www.kaggle.com/discussions/questions-and-answers/379642)