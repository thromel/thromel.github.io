---
permalink: /
title: "About Me"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi! I'm Tanzim Hossain Romel, a Software Development Engineer at IQVIA with expertise in distributed systems and full-stack development. I leverage full-stack development, cloud-native architectures, and AI/ML to build scalable solutions.

[View Full CV (PDF)](/files/CV_Tanzim_Hossain_Romel.pdf){: .btn .btn--primary} [View CV Page](/cv/){: .btn .btn--info}

Current Work
------
**Software Development Engineer 1** at IQVIA (June 2023 – Present)  
Backend Engineer at the KPI Library team

**Key Contributions**:
* **Performance Optimization**
  * Optimized microservices architecture by implementing MongoDB caching as a Kubernetes service across all services
  * Implemented in-memory caching for specific services, reducing query response time by 30%
  * Redesigned dashboard loading flow architecture, improving loading times by 40%
  * Enhanced overall system performance through architectural improvements

* **Innovation & AI Integration**
  * Developed a JSON-based dynamic dashboard creation feature powered by LLMs
  * Enabled natural language inputs for dashboard generation and customization
  * Enhanced the existing translation system with dynamic localization features
  * Improved platform flexibility and efficiency through automation

* **DevOps & Infrastructure**
  * Improved CI/CD pipeline with parallelized GitLab workflows
  * Implemented automated test retries, reducing build and deployment times by 40%
  * Implemented gRPC for high-volume microservice communication
  * Reduced service latency by 40% and increased throughput by 25%

**Tech Stack**: C#, .NET, PostgreSQL, MongoDB, Microsoft SQL Server, Entity Framework, Redis, AWS, Docker, Kubernetes, Jaeger

Technical Expertise
------
<div class="tech-grid" markdown="0">
<div class="tech-category">
  <h3>Languages & Frameworks</h3>
  <ul>
    <li><strong>Backend:</strong> C#/.NET, Python, TypeScript</li>
    <li><strong>Frontend:</strong> React.js, Blazor</li>
    <li><strong>Other:</strong> Solidity, C++</li>
  </ul>
</div>

<div class="tech-category">
  <h3>Cloud & DevOps</h3>
  <ul>
    <li><strong>Platforms:</strong> Azure, AWS</li>
    <li><strong>Containers:</strong> Docker, Kubernetes</li>
    <li><strong>IaC:</strong> Terraform, Azure Bicep</li>
    <li><strong>CI/CD:</strong> GitHub Actions, GitLab CI</li>
  </ul>
</div>

<div class="tech-category">
  <h3>Data & AI/ML</h3>
  <ul>
    <li><strong>Databases:</strong> PostgreSQL, MongoDB, Redis, CosmosDB</li>
    <li><strong>ML/DL:</strong> PyTorch, TensorFlow</li>
    <li><strong>Vision:</strong> OpenCV, Hugging Face</li>
  </ul>
</div>

<div class="tech-category">
  <h3>Tools & Technologies</h3>
  <ul>
    <li><strong>Communication:</strong> gRPC, REST</li>
    <li><strong>Monitoring:</strong> OpenTelemetry, Jaeger</li>
    <li><strong>Performance:</strong> Redis, Entity Framework</li>
  </ul>
</div>
</div>

<style>
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}
.tech-category {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.tech-category h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}
.tech-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tech-category li {
  margin: 8px 0;
  line-height: 1.4;
}
.tech-category strong {
  color: #2c3e50;
}
</style>

Research & Writing
------
I actively contribute to the tech community through:
* [Research projects](/research/) in distributed systems, blockchain, and AI
* [Technical blog posts](/blog/) on software engineering and industry trends
* Paper reviews and insights on emerging technologies
* Open-source contributions and documentation

My research interests span multiple domains:
* Investigating Contracts for LLM Libraries, extending ML API contracts research
* Blockchain applications in healthcare, focusing on secure data management
* Network protocol optimization with TCP Vegas+
* Deep learning for South Asian language processing

Career Vision
------
* **Short-Term**: Lead projects integrating generative AI into distributed systems
* **Long-Term**: Architect large-scale, privacy-first platforms for healthcare or fintech industries

Latest Blog Posts
------
{% for post in site.blog limit:3 %}
  {% include archive-single.html %}
{% endfor %}

[View All Posts](/blog/){: .btn .btn--primary}

Feel free to explore my [projects](/portfolio/) or check out my detailed [CV](/cv/) to learn more about my work and experience.
