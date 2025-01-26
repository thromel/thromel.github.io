---
title: "Production-Grade URL Shortener"
excerpt: "A secure, globally scalable URL shortener with enterprise-grade reliability<br/><img src='/images/url-shortener.png'>"
collection: portfolio
---

[View Project on GitHub](https://github.com/thromel/url-shortener)

**Objective**: Design a secure, globally scalable URL shortener with enterprise-grade reliability.

## Tech Stack
### Backend
* .NET 8
* Azure Functions
* Azure CosmosDB
* Redis Cache

### Frontend
* React.js
* Blazor

### Infrastructure & DevOps
* Azure Bicep (Infrastructure as Code)
* Azure Front Door
* GitHub Actions (CI/CD)
* Microsoft Entra ID
* Azure Key Vault

## Key Achievements
* Built a **microservices architecture** with auto-scaling, reducing latency by 35% under peak loads
* Implemented **Infrastructure as Code (IaC)** using Azure Bicep, enabling rapid environment replication
* Integrated **distributed tracing** via OpenTelemetry for real-time performance monitoring
* System handles 10,000+ requests/sec with 99.99% uptime

## Technical Implementation
* Microservices architecture for scalability
* Distributed caching with Redis
* Real-time monitoring with Application Insights
* Load balancing with Azure Front Door
* Automated deployment pipelines
* Comprehensive logging and telemetry

## Security Features
* Microsoft Entra ID integration
* Azure Key Vault for secrets management
* Rate limiting and DDoS protection
* SSL/TLS encryption
* Request validation and sanitization

## Performance Optimizations
* Multi-region deployment
* CDN integration
* Database query optimization
* Cache hit ratio > 95%
* Response time < 100ms (p95)
