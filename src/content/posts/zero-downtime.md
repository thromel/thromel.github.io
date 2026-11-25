---
title: "Zero Downtime Deployments in Kubernetes: How We Keep Our Services
  Running While We Ship"
date: 2024-11-29
categories:
  - kubernetes
  - devops
  - microservices
tags:
  - kubernetes
  - zero-downtime
  - deployment
  - microservices
  - devops
  - rolling-updates
---

Picture this. You are at your favorite online store, and you add items to your cart. Then the site goes down and shows an "Under Maintenance" message. Now imagine that this is your company's service. That is why we invested in zero downtime deployments. This post shows how we built them in our Kubernetes microservice architecture.

## What Are Zero Downtime Deployments?

A zero downtime deployment updates your application, and your users never notice. Think of a store that stays open during a renovation. Customers still shop while workers update things quietly in the background.

With microservices on Kubernetes, this is both harder and easier. It is harder because you must coordinate many services. It is easier because Kubernetes gives us good tools for the job.

## Why This Matters More Than Ever

When we moved to microservices three years ago, we had 12 services. Today we have over 50, and each service can deploy several times per day. Without zero downtime deployments, we would show maintenance pages all the time. Our users would hate us, and they would be right.

## The Foundation: Understanding How Kubernetes Updates Work

First, here is how Kubernetes handles updates. By default, Kubernetes uses "rolling updates." Imagine three copies of your application in operation. Kubernetes does not update all three at once. It updates them one at a time, like changing the tires on a moving car.

A typical update has these steps:

1. Kubernetes creates a new pod with your updated code
2. It waits for the new pod to be ready
3. It starts sending traffic to the new pod
4. It removes an old pod
5. It repeats until all pods are updated

This sounds simple, but the details are hard. The sections below show how we made each step reliable.

## Our Implementation Journey: The Building Blocks

### Step 1: Getting Health Checks Right

We learned first that Kubernetes must know when your application is ready. We use three types of health checks, and each one does a different job.

**Startup probes** tell Kubernetes when your application finished its startup. It is like waiting for your computer to boot before you open programs.

**Liveness probes** check that your application is still alive. If the probe fails, Kubernetes restarts the pod. It is like checking someone's pulse.

**Readiness probes** check that your pod can handle traffic. An application can be alive and still not be ready to serve customers.

This is how we configure them in our services:

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

The endpoints do the real work. Our `/health/ready` endpoint does more than return "OK". It checks that:

- Database connections are open
- The cache is warm
- All dependent services are reachable
- Initial data is loaded

So a pod receives traffic only when it is ready to handle it.

### Step 2: Graceful Shutdowns - The Art of Saying Goodbye

When Kubernetes removes a pod, it does not cut the power. It sends a SIGTERM signal, which politely asks your application to stop. Many teams make mistakes here.

Our shutdown handler does four things:

1. Stops accepting new requests
2. Waits for ongoing requests to complete
3. Closes database connections cleanly
4. Then exits

This is a simplified version of our Go implementation:

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

We also configure Kubernetes to give the application enough time for this graceful shutdown:

```yaml
spec:
  terminationGracePeriodSeconds: 60  # Gives us 60 seconds to shut down cleanly
```

### Step 3: The Service Mesh Safety Net

Even with good health checks and graceful shutdowns, we found edge cases. Sometimes Kubernetes marked a pod for deletion, but load balancers still sent it traffic for a few seconds. This caused errors.

We added Istio, a service mesh, to fix this. A service mesh is a traffic controller between all your services. It knows which pods are healthy and routes traffic only to them.

Istio gave us automatic retries for failed requests and circuit breaking to prevent cascade failures. It also gave us fine-grained traffic control during deployments.

This is how we configure Istio for zero downtime deployments:

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

We do not update all pods at once. We deploy to a small percentage first, so a problem affects only a few users.

We use Flagger to automate canary deployments. Flagger moves traffic to the new version in steps and monitors metrics as it goes. If errors increase sharply, it rolls back automatically.

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

This configuration increases traffic to the new version from 0% to 50% in 5% steps. If the success rate drops below 99% or latency goes above 500ms, Flagger rolls back automatically.

### Step 5: Database Migrations - The Trickiest Part

A code update is the easy part. A database update during a zero downtime deployment is much harder.

We follow a pattern called "expand and contract":

1. **Expand**: Add new columns or tables, and keep the old ones
2. **Migrate**: Deploy new code that writes to both the old and new schemas
3. **Backfill**: Copy data from the old format to the new one
4. **Switch**: Deploy code that reads from the new schema and still writes to both
5. **Contract**: Remove the old schema when we are confident

This is a real example from when we added a `customer_email` field to our orders table:

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

Every database change must be backward compatible with the previous version of your code.

## Real-World Challenges We Faced

### Challenge 1: The Thundering Herd

Our first health checks were too simple. All pods became ready at the same moment and caused a traffic spike. We fixed this with jitter (random delays) in our readiness checks.

### Challenge 2: Long-Running Requests

Some of our API endpoints process large data exports that take minutes. Our first 30-second grace period was not enough. We increased the grace period for specific services, added request deadlines, and moved long operations to background jobs.

### Challenge 3: Dependency Coordination

Microservices depend on each other. When service A depends on service B, a deployment of B needs careful coordination. We fixed this with API versioning, feature flags, and backward compatibility requirements.

## Monitoring: How We Know It's Working

We track several metrics:

**Deployment success rate.** This is the percentage of deployments that complete without a rollback. Our target is 99%.

**Error rate during deployments.** We graph error rates with deployment events on top. We investigate every spike during a deployment.

**Pod restart count.** Frequent restarts show problems with our health checks or application stability.

**User-facing availability.** This is the metric that matters most to users. We keep availability at 99.95%.

This is a Prometheus query we use to track errors during deployments:

```promql
# Error rate in the last 5 minutes
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ 
sum(rate(http_requests_total[5m]))
```

## Practical Exercise: Try It Yourself

You can see a zero downtime deployment in a small exercise:

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

2. In another terminal, curl the service in a loop:

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

Watch the output. The server addresses change one at a time, and no request fails.

## Lessons Learned: Our Key Takeaways

We improved our approach for three years. This is what we wish we knew at the start.

**Start simple.** Do not try to build everything at once. Get basic health checks to work first, then add more.

**Test failure scenarios.** We run regular "chaos engineering" sessions where we break things on purpose. They found issues we did not imagine.

**Teach the patterns.** Every team must understand these patterns. We run monthly workshops and keep a deployment playbook.

**Automate.** Manual deployments do not scale. Invest in CI/CD pipelines early.

**Monitor everything.** You need data to improve. Collect metrics from day one.

## The Business Impact

Zero downtime deployments changed four things for us:

- Deployment frequency went from weekly to several times a day
- Customer complaints about downtime dropped to zero
- Developers became much more confident about deployments
- We can push critical fixes at any time, not only during "maintenance windows"

## Looking Forward: What's Next?

We are now exploring four next steps:

- **Progressive delivery**: releases driven by feature flags, beyond canary deployments
- **Multi-region deployments**: zero downtime when we update across geographic regions
- **GitOps**: Git as the single source of truth for our deployments
- **Service preview environments**: developers test service interactions before they merge

## Your Turn: Getting Started

To add zero downtime deployments in your organization, follow this roadmap:

1. **Week 1-2**: Add proper health checks to one service
2. **Week 3-4**: Add graceful shutdown handling
3. **Week 5-6**: Set up monitoring and alerts
4. **Week 7-8**: Run your first canary deployment
5. **Week 9-10**: Document patterns and train your team
6. **Week 11-12**: Expand to additional services

Each service can need a slightly different approach. Start with one service and iterate.

## Conclusion: Why This Matters

Zero downtime deployment respects your users' time and trust. Every maintenance window breaks a promise to someone who wants to use your service.

These patterns made deployments routine for us instead of frightening. Our developers deploy with confidence, and our users never see maintenance pages. We use these patterns every day in production.

Happy deploying!

---

_Do you have questions about zero downtime deployments, or a pattern that works well for your team? Write to us at engineering@yourcompany.com or find us on our engineering blog._
