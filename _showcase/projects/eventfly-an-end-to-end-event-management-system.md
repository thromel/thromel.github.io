---
layout: showcase
show: true
width: 8
date: 2022-07-01 00:00:00 +0800
group: Projects
title: EventFly – Distributed Microservices Event Platform
excerpt: A comprehensive microservices-based event management platform engineered for scalability, resilience, and rapid feature delivery, supporting end-to-end workflows for event creation, promotion, participant engagement, and monetization.
technologies:
  - TypeScript
  - Node.js
  - Python
  - React
  - Kubernetes
  - Skaffold
  - Helm
  - NATS Streaming
  - MongoDB Atlas
  - Redis
  - Stripe API
  - Prometheus
  - Grafana
  - Docker
  - GitHub Actions
---

## Lead Architect & Developer | May 2022 - July 2022

<div class="text-end mb-3">
    <a href="https://github.com/eventfly/Microservices" target="_blank" class="btn btn-sm btn-outline-dark">
        <i class="fab fa-github"></i> View on GitHub
    </a>
</div>

### Project Overview

EventFly is a distributed event management platform engineered for scalability, resilience, and rapid feature delivery. 
Architected from the ground up with a microservices and event-driven paradigm, it supports end-to-end workflows for 
event creation, promotion, participant engagement, and monetization.

<div class="row mb-4">
    <div class="col-md-12">
        <div class="card mb-3">
            <div class="card-header bg-light">
                <strong>EventFly Architecture</strong>
            </div>
            <div class="card-body text-center">
                <img src="{{ 'assets/images/eventfly-architecture.png' | relative_url }}" class="img-fluid mb-2" alt="EventFly Architecture">
                <small class="text-muted">Microservices architecture with event-driven communication via NATS Streaming</small>
            </div>
        </div>
    </div>
</div>

### Technical Architecture

- **Microservices Architecture:** Seven core stateless services (Auth, Org, Events, Participant, Newsfeed, Payment, Analytics), each encapsulating its own domain logic and operating on an isolated MongoDB instance. All services are containerized and orchestrated with Kubernetes (EKS/GKE), supporting blue/green deployments and zero-downtime rollouts.
- **Event-Driven Communication:** Service decoupling is achieved via a centralized NATS Streaming (STAN) event bus. Domain events (e.g., event:created, order:paid) are published and subscribed to with at-least-once delivery semantics and manual ACK, enabling robust asynchronous flows and horizontal scalability.
- **API Layer & Protocols:** RESTful APIs (Express/Node.js) serve both PWA frontends and organizer dashboards. Payloads are strictly typed (TypeScript) and versioned at the event level. Planned GraphQL API gateway for federated queries.
- **Data Management:** Each microservice owns its schema and indices, ensuring domain-driven design and strict data encapsulation. The Analytics service integrates Python-based recommendation engines (TF-IDF + geo-weighting), called via Node–Python wrappers for advanced querying.
- **Security & Compliance:** Implements JWT authentication, RBAC authorization middleware, secure inter-service secrets (Kubernetes Secrets), TLS everywhere, and rigorous separation of PII via per-service DBs. Follows the principle of least privilege for both data and network access.
- **Payment Processing:** Seamless integration with Stripe for PCI-compliant payments and subscription management, complete with webhook-based reconciliation and event-driven order finalization.
- **DevOps & CI/CD:** Automated pipelines with GitHub Actions, Docker Buildx, and Skaffold, supporting multi-environment deployment and continuous integration. Configurations are templated with Helm and managed as code.
- **Observability:** End-to-end logging (pino/winston), metrics collection (Prometheus), alerting (Grafana), and future integration of OpenTelemetry for distributed tracing.

### Deployment Architecture

<div class="row mb-4">
    <div class="col-md-12">
        <div class="card mb-3">
            <div class="card-header bg-light">
                <strong>Kubernetes Deployment Architecture</strong>
            </div>
            <div class="card-body text-center">
                <img src="{{ 'assets/images/eventfly-deployment-architecture.png' | relative_url }}" class="img-fluid mb-2" alt="EventFly Deployment Architecture">
                <small class="text-muted">Multi-environment Kubernetes deployment with infrastructure as code</small>
            </div>
        </div>
    </div>
</div>

- **Infrastructure as Code:** All infrastructure defined declaratively using Terraform for cloud resources and Helm charts for Kubernetes resources, ensuring consistency across environments and enabling GitOps workflows.
- **Multi-Environment Strategy:** Isolated development, staging, and production environments with progressive deployment through CI/CD pipelines. Configuration differences managed through Kubernetes ConfigMaps and Secrets injected at runtime.
- **Scalability:** Horizontal Pod Autoscalers configured for all services based on CPU/memory metrics. Database scaling handled through MongoDB Atlas with preconfigured sharding for high-traffic services (Events, Participants).
- **Namespace Isolation:** Logical separation using Kubernetes namespaces (core-services, data-services, monitoring) with network policies enforcing security boundaries between service groups.
- **High Availability:** Services deployed with minimum 2 replicas across availability zones. Critical components (NATS, MongoDB) configured with automatic failover. Readiness/liveness probes ensure traffic only routes to healthy pods.
- **Secret Management:** Sensitive configuration (API keys, database credentials) stored in Kubernetes Secrets, with automated rotation pipelines for production credentials.
- **Blue/Green Deployments:** Zero-downtime deployments using Kubernetes rolling updates with configurable deployment strategies. Canary deployments for high-risk services to validate changes with limited traffic exposure.

### System Components

<div class="table-responsive mb-3">
    <table class="table table-bordered">
        <thead class="table-light">
            <tr>
                <th>Service</th>
                <th>Responsibility</th>
                <th>Tech Stack</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Auth Service</td>
                <td>User registration, authentication, JWT management</td>
                <td>TypeScript, Express, MongoDB, JWT</td>
            </tr>
            <tr>
                <td>Org Service</td>
                <td>Organization profiles, team management, billing</td>
                <td>TypeScript, Express, MongoDB</td>
            </tr>
            <tr>
                <td>Events Service</td>
                <td>Event creation, management, ticketing</td>
                <td>TypeScript, Express, MongoDB</td>
            </tr>
            <tr>
                <td>Participant Service</td>
                <td>Attendee management, registrations, check-ins</td>
                <td>TypeScript, Express, MongoDB</td>
            </tr>
            <tr>
                <td>Newsfeed Service</td>
                <td>Personalized content, notifications</td>
                <td>TypeScript, Express, MongoDB</td>
            </tr>
            <tr>
                <td>Payment Service</td>
                <td>Payment processing, order management</td>
                <td>TypeScript, Express, MongoDB, Stripe</td>
            </tr>
            <tr>
                <td>Analytics Service</td>
                <td>Reporting, recommendations, business intelligence</td>
                <td>TypeScript, Python, MongoDB, TensorFlow</td>
            </tr>
        </tbody>
    </table>
</div>

### My Role

Led the architectural design, implementation, and deployment of the entire platform. Defined service boundaries, 
established communication patterns, implemented security, and drove adoption of cloud-native DevOps and observability 
practices. Wrote foundational libraries for event contracts and API consistency across services.

### Key Learning Outcomes

This project exemplifies my expertise in distributed systems, event-driven design, secure cloud deployments, 
and engineering for scale and agility in production SaaS environments. The architecture decisions prioritized 
domain isolation while ensuring consistency through well-defined event contracts, demonstrating practical application 
of modern cloud-native development practices. 