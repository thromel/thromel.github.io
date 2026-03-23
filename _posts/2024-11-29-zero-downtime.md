---
layout: post
title: "Zero Downtime Deployments in Kubernetes: How We Keep Our Services Running While We Ship"
date: 2024-11-29
categories: [kubernetes, devops, microservices]
tags: [kubernetes, zero-downtime, deployment, microservices, devops, rolling-updates]
image: /assets/images/projects/zero-downtime-deployments.png
---

# Zero Downtime Deployments in Kubernetes: How We Keep Our Services Running While We Ship

Picture this scenario. You're at your favorite online store, adding items to your cart. Suddenly, the site goes down with a "Under Maintenance" message. Frustrating, right? Now imagine if that was your company's service. That's exactly why we invested in zero downtime deployments, and today I'll share how we achieved this in our Kubernetes microservice architecture.

## What Are Zero Downtime Deployments?

Let's start with the basics. Zero downtime deployment means updating your application without your users ever noticing. Think of it like renovating a store while keeping it open. Customers can still shop while workers quietly update things in the background.

In the world of microservices running on Kubernetes, this becomes both more complex and more achievable. Complex because you have many services to coordinate. Achievable because Kubernetes gives us powerful tools to make it happen.

## Why This Matters More Than Ever

When we started our microservices journey three years ago, we had 12 services. Today, we have over 50. Each service might deploy multiple times per day. Without zero downtime deployments, we'd be showing maintenance pages constantly. Our users would hate us, and rightfully so.

## The Foundation: Understanding How Kubernetes Updates Work

Before diving into our implementation, let's understand how Kubernetes handles updates. Kubernetes uses a concept called "rolling updates" by default. Imagine you have three copies of your application running. Kubernetes doesn't update all three at once. Instead, it updates them one by one, like changing tires on a moving car.

Here's what happens during a typical update:

1. Kubernetes creates a new pod with your updated code
2. It waits for the new pod to be ready
3. It starts sending traffic to the new pod
4. It removes an old pod
5. It repeats until all pods are updated

This sounds simple, but the devil is in the details. Let's explore how we made this process truly seamless.

## Our Implementation Journey: The Building Blocks

### Step 1: Getting Health Checks Right

The first thing we learned? Kubernetes needs to know when your application is ready. We use three types of health checks, and understanding the difference is crucial.

**Startup Probes**: These tell Kubernetes when your application has finished starting up. Think of it like waiting for your computer to boot before trying to open programs.

**Liveness Probes**: These check if your application is still alive. If it fails, Kubernetes restarts the pod. It's like checking someone's pulse.

**Readiness Probes**: These determine if your pod can handle traffic. Just because your application is alive doesn't mean it's ready to serve customers.

Here's how we implement these in our services:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: order-service
        image: mycompany/order-service:v2.1.0
        ports:
        - containerPort: 8080
        
        # Startup probe - gives the app time to initialize
        startupProbe:
          httpGet:
            path: /health/startup
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 30  # Allows up to 150 seconds for startup
        
        # Liveness probe - restarts if the app crashes
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 0
          periodSeconds: 10
          failureThreshold: 3
        
        # Readiness probe - controls traffic routing
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 0
          periodSeconds: 5
          failureThreshold: 3
```

The magic happens in how we implement these endpoints. Our `/health/ready` endpoint doesn't just return "OK". It actually checks:
- Database connections are established
- Cache is warmed up
- All dependent services are reachable
- Initial data is loaded

This ensures we only receive traffic when we're truly ready to handle it.

### Step 2: Graceful Shutdowns - The Art of Saying Goodbye

When Kubernetes decides to remove a pod, it doesn't just pull the plug. It sends a SIGTERM signal, which is like politely asking your application to shut down. Here's where many teams stumble.

We implemented a shutdown handler that:
1. Stops accepting new requests
2. Waits for ongoing requests to complete
3. Closes database connections cleanly
4. Then exits

Here's a simplified version of our Go implementation:

```go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    // Create our HTTP server
    srv := &http.Server{Addr: ":8080"}
    
    // Handle our routes
    http.HandleFunc("/api/orders", handleOrders)
    
    // Start server in a goroutine
    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatalf("ListenAndServe(): %v", err)
        }
    }()
    
    // Wait for interrupt signal
    sigterm := make(chan os.Signal, 1)
    signal.Notify(sigterm, syscall.SIGTERM, syscall.SIGINT)
    <-sigterm
    
    log.Println("Shutdown signal received, draining requests...")
    
    // Give ongoing requests 30 seconds to complete
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    // Stop accepting new requests and wait for existing ones
    if err := srv.Shutdown(ctx); err != nil {
        log.Printf("HTTP server Shutdown error: %v", err)
    }
    
    log.Println("Graceful shutdown complete")
}
```

We also configure Kubernetes to give us enough time for this graceful shutdown:

```yaml
spec:
  terminationGracePeriodSeconds: 60  # Gives us 60 seconds to shut down cleanly
```

### Step 3: The Service Mesh Safety Net

Even with perfect health checks and graceful shutdowns, we discovered edge cases. Sometimes, a pod would be marked for deletion, but load balancers would still send it traffic for a few seconds. This created errors.

Enter Istio, our service mesh. Think of a service mesh as a smart traffic controller that sits between all your services. It knows exactly which pods are healthy and routes traffic accordingly.

With Istio, we gained:
- Automatic retries for failed requests
- Circuit breaking to prevent cascade failures
- Fine-grained traffic control during deployments

Here's how we configure Istio for zero downtime deployments:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: order-service
spec:
  host: order-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
    loadBalancer:
      simple: ROUND_ROBIN
    outlierDetection:
      # Remove unhealthy instances from load balancing
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
      minHealthPercent: 50
```

### Step 4: Testing in Production with Canary Deployments

Here's where things get interesting. Instead of updating all pods at once, we deploy to a small percentage first. If something goes wrong, only a few users are affected.

We use Flagger, which automates canary deployments. It gradually shifts traffic to the new version while monitoring metrics. If errors spike, it automatically rolls back.

```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: order-service
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  service:
    port: 80
  analysis:
    # Check every 30 seconds
    interval: 30s
    # Number of iterations before promotion
    iterations: 10
    # Max traffic percentage routed to canary
    maxWeight: 50
    # Incremental traffic increase
    stepWeight: 5
    metrics:
    # Check success rate
    - name: success-rate
      thresholdRange:
        min: 99
      interval: 1m
    # Check response time
    - name: latency
      thresholdRange:
        max: 500
      interval: 30s
```

This configuration slowly increases traffic to the new version from 0% to 50% in 5% increments. If the success rate drops below 99% or latency exceeds 500ms, it rolls back automatically.

### Step 5: Database Migrations - The Trickiest Part

Updating code is one thing. Updating databases during zero downtime deployments? That's where things get really interesting.

We follow a pattern called "expand and contract":

1. **Expand**: Add new columns or tables without removing old ones
2. **Migrate**: Deploy new code that writes to both old and new schemas
3. **Backfill**: Copy data from old format to new
4. **Switch**: Deploy code that reads from new schema but still writes to both
5. **Contract**: Remove old schema once we're confident

Here's a real example from when we added a `customer_email` field to our orders table:

```sql
-- Step 1: Expand - Add new column (non-breaking change)
ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);

-- Step 2: Backfill existing data
UPDATE orders o
SET customer_email = (
    SELECT email FROM customers c 
    WHERE c.id = o.customer_id
)
WHERE customer_email IS NULL;

-- Step 3: After new code is deployed and stable, make it required
ALTER TABLE orders ALTER COLUMN customer_email SET NOT NULL;
```

The key insight? Every database change must be backward compatible with the previous version of your code.

## Real-World Challenges We Faced

### Challenge 1: The Thundering Herd

When we first implemented health checks, we made them too simple. All pods would become ready at the same moment, causing a traffic spike. We solved this by adding jitter (random delays) to our readiness checks.

### Challenge 2: Long-Running Requests

Some of our API endpoints process large data exports that take minutes. Our initial 30-second grace period wasn't enough. We had to:
- Increase the grace period for specific services
- Implement request deadlines
- Move long operations to background jobs

### Challenge 3: Dependency Coordination

Microservices don't live in isolation. When service A depends on service B, deploying B requires careful coordination. We solved this with:
- API versioning
- Feature flags
- Backward compatibility requirements

## Monitoring: How We Know It's Working

You can't improve what you don't measure. We track several metrics:

**Deployment Success Rate**: Percentage of deployments that complete without rollback. Our target is 99%.

**Error Rate During Deployments**: We graph error rates with deployment events overlaid. Any spike during deployment gets investigated.

**Pod Restart Count**: Frequent restarts indicate problems with our health checks or application stability.

**User-Facing Availability**: The ultimate metric. We maintain 99.95% availability.

Here's a Prometheus query we use to track errors during deployments:

```promql
# Error rate in the last 5 minutes
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ 
sum(rate(http_requests_total[5m]))
```

## Practical Exercise: Try It Yourself

Want to see zero downtime deployment in action? Here's a simple exercise:

1. Deploy a basic web service to Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # This ensures zero downtime
  selector:
    matchLabels:
      app: hello-world
  template:
    metadata:
      labels:
        app: hello-world
    spec:
      containers:
      - name: hello-world
        image: nginxdemos/hello:0.2
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 2
---
apiVersion: v1
kind: Service
metadata:
  name: hello-world
spec:
  selector:
    app: hello-world
  ports:
  - port: 80
    targetPort: 80
```

2. In another terminal, continuously curl the service:

```bash
while true; do 
  curl -s http://hello-world | grep -o "Server address: [^<]*"
  sleep 0.5
done
```

3. Update the deployment to a new version:

```bash
kubectl set image deployment/hello-world hello-world=nginxdemos/hello:0.3
```

Watch the output. You'll see the server addresses change gradually, but no failed requests!

## Lessons Learned: Our Key Takeaways

After three years of refining our approach, here's what we wish we knew from the start:

**Start Simple**: Don't try to implement everything at once. Get basic health checks working first, then add sophistication.

**Test Failure Scenarios**: Regular "chaos engineering" sessions where we deliberately break things have been invaluable. We've found issues we never would have imagined.

**Communication Is Key**: Every team needs to understand these patterns. We run monthly workshops and maintain a deployment playbook.

**Automation Is Essential**: Manual deployments don't scale. Invest in CI/CD pipelines early.

**Monitor Everything**: You need data to improve. Start collecting metrics from day one.

## The Business Impact

Since implementing zero downtime deployments, we've seen remarkable improvements:
- Deployment frequency increased from weekly to multiple times daily
- Customer complaints about downtime dropped to zero
- Developer confidence in deployments skyrocketed
- We can push critical fixes any time, not just during "maintenance windows"

## Looking Forward: What's Next?

Our zero downtime deployment journey doesn't end here. We're currently exploring:

**Progressive Delivery**: Going beyond canary deployments to feature-flag-driven releases

**Multi-Region Deployments**: Ensuring zero downtime even when updating across geographic regions

**GitOps**: Using Git as the single source of truth for our deployments

**Service Preview Environments**: Letting developers test service interactions before merging

## Your Turn: Getting Started

Ready to implement zero downtime deployments in your organization? Here's your roadmap:

1. **Week 1-2**: Implement proper health checks for one service
2. **Week 3-4**: Add graceful shutdown handling
3. **Week 5-6**: Set up monitoring and alerts
4. **Week 7-8**: Implement your first canary deployment
5. **Week 9-10**: Document patterns and train your team
6. **Week 11-12**: Expand to additional services

Remember, this is a journey, not a destination. Each service might need slightly different approaches. The key is to start somewhere and iterate.

## Conclusion: Why This Matters

Zero downtime deployment isn't just a technical achievement. It's about respecting your users' time and trust. Every maintenance window is a broken promise to someone trying to use your service.

By implementing these patterns, we've transformed deployments from scary events to routine operations. Our developers deploy with confidence. Our users never see maintenance pages. Our business can iterate and improve continuously.

The techniques I've shared aren't theoretical. They're battle-tested patterns we use every day. Start small, measure everything, and gradually build your confidence. Before you know it, you'll wonder how you ever lived with deployment downtime.

Remember: your users don't care about your deployment process. They just want your service to work. Zero downtime deployments ensure it always does.

Happy deploying!

---

*Have questions about implementing zero downtime deployments? Found a pattern that works well for your team? We'd love to hear from you. Drop us a line at engineering@yourcompany.com or find us on our engineering blog.*