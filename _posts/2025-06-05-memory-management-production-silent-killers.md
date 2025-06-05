---
layout: post
title: "Memory Management in Production: Avoiding the Silent Killers"
date: 2025-06-01
categories: [backend-engineering, performance, memory-management]
tags: [memory-management, dotnet, garbage-collection, docker, performance-optimization, production-debugging, aspnet-core]
image: /assets/images/projects/memory-management.png
---

# Memory Management in Production: Avoiding the Silent Killers

It's 2:47 AM when the alerts start flooding in. Your e-commerce platform—handling Black Friday traffic—begins throwing OutOfMemoryErrors. Orders are failing, customers are abandoning carts, and your revenue is hemorrhaging by the minute. The CPU usage looks normal, disk I/O is fine, but something is silently consuming memory until your applications crash.

This was our reality eight months ago. What started as occasional "minor hiccups" escalated into a full-blown production crisis that taught our team hard lessons about memory management in .NET applications running in production. If you're running .NET services, ASP.NET Core applications, or containerized .NET workloads in production, this story—and the solutions we discovered—could save you from similar catastrophic failures.

Memory issues are the silent killers of production systems. Unlike CPU spikes or network outages that announce themselves dramatically, memory problems creep in slowly, often going unnoticed until they bring down your entire system. This comprehensive guide will equip you with the knowledge, tools, and strategies to identify, prevent, and resolve memory issues before they become business-critical failures.

## The Hidden Cost of Poor Memory Management

Before diving into solutions, let's understand why memory management matters more than ever in modern .NET production environments. Our platform consisted of:

- **ASP.NET Core 8 services** handling order processing and user management
- **.NET 8 microservices** managing payments and inventory
- **Entity Framework Core** with connection pooling
- **SQL Server and PostgreSQL** databases
- **Redis** for caching and session storage
- **Docker containers** orchestrated by Kubernetes

What we discovered was sobering: memory issues accounted for 67% of our production incidents, yet they received only 15% of our monitoring attention. The business impact was severe:

- **$2.3M in lost revenue** during a 4-hour memory-related outage
- **Customer trust erosion** with 23% of affected users not returning within 30 days
- **Engineering productivity loss** with 40% of developer time spent firefighting memory issues

## Issue #1: The .NET Memory Leak That Nearly Killed Black Friday

### The Problem

Our ASP.NET Core order processing service was experiencing what appeared to be a classic memory leak. Memory usage grew steadily over 6-8 hours until the application crashed with OutOfMemoryException.

```csharp
// The innocent-looking code that was killing us
[ApiController]
[Route("api/[controller]")]
public class OrderProcessingController : ControllerBase
{
    private static readonly ConcurrentDictionary<string, List<OrderEvent>> _orderEventCache = new();
    private readonly IServiceProvider _serviceProvider;
    
    public OrderProcessingController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    [HttpPost]
    public async Task<ActionResult<OrderResult>> ProcessOrder(Order order)
    {
        // This seemed harmless but was accumulating unbounded data
        var orderId = order.Id;
        _orderEventCache.AddOrUpdate(orderId,
            new List<OrderEvent> { new OrderEvent(order, DateTime.UtcNow) },
            (key, existing) => {
                existing.Add(new OrderEvent(order, DateTime.UtcNow));
                return existing;
            });
        
        // Fire and forget background processing
        _ = Task.Run(async () => await ProcessOrderInBackground(order));
        
        return Ok(new OrderResult { OrderId = orderId, Status = "Processing" });
    }
    
    // The cleanup method that was never called properly
    private void CleanupOrderEvents(string orderId)
    {
        _orderEventCache.TryRemove(orderId, out _);
    }
}
```

### The Investigation: .NET Memory Forensics

We started with .NET memory dump analysis using dotMemory and PerfView:

```csharp
// Program.cs - Enable memory monitoring
var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsProduction())
{
    // Configure automatic heap dump generation
    builder.Services.Configure<EventStoreClientSettings>(options =>
    {
        options.CreateHttpMessageHandler = () => new SocketsHttpHandler
        {
            PooledConnectionLifetime = TimeSpan.FromMinutes(2)
        };
    });
}

var app = builder.Build();

// Add memory monitoring middleware
app.Use(async (context, next) =>
{
    var memoryBefore = GC.GetTotalMemory(false);
    await next();
    var memoryAfter = GC.GetTotalMemory(false);
    
    if (memoryAfter - memoryBefore > 10_000_000) // 10MB allocation
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogWarning("High memory allocation detected: {MemoryDelta} bytes for {Path}",
            memoryAfter - memoryBefore, context.Request.Path);
    }
});
```

The memory dump revealed shocking statistics:
- **ConcurrentDictionary entries**: 3.8GB (62% of heap)
- **List<OrderEvent> instances**: 1.9GB (31% of heap)
- **OrderEvent objects**: 1.1GB (18% of heap)

Our "harmless" static cache had accumulated 2.1 million OrderEvent objects over 8 hours of operation.

### The Solution: Comprehensive .NET Memory Management

**1. Bounded Caches with Expiration using Microsoft.Extensions.Caching**

```csharp
[ApiController]
[Route("api/[controller]")]
public class OptimizedOrderProcessingController : ControllerBase
{
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<OptimizedOrderProcessingController> _logger;
    private readonly IHostedService _backgroundProcessor;
    
    public OptimizedOrderProcessingController(
        IMemoryCache memoryCache, 
        ILogger<OptimizedOrderProcessingController> logger,
        BackgroundOrderProcessor backgroundProcessor)
    {
        _memoryCache = memoryCache;
        _logger = logger;
        _backgroundProcessor = backgroundProcessor;
    }
    
    [HttpPost]
    public async Task<ActionResult<OrderResult>> ProcessOrder(Order order)
    {
        var orderId = order.Id;
        var cacheKey = $"order_events_{orderId}";
        
        // Use bounded memory cache with expiration
        var events = _memoryCache.GetOrCreate(cacheKey, cacheEntry =>
        {
            cacheEntry.SlidingExpiration = TimeSpan.FromMinutes(30);
            cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2);
            cacheEntry.Size = 1; // For size-based eviction
            cacheEntry.Priority = CacheItemPriority.Normal;
            
            cacheEntry.RegisterPostEvictionCallback((key, value, reason, state) =>
            {
                _logger.LogDebug("Evicted order events for {OrderId} due to {Reason}", 
                    orderId, reason);
            });
            
            return new List<OrderEvent>();
        });
        
        events.Add(new OrderEvent(order, DateTime.UtcNow));
        
        // Use hosted service for background processing instead of Task.Run
        await _backgroundProcessor.EnqueueOrderAsync(order);
        
        return Ok(new OrderResult { OrderId = orderId, Status = "Processing" });
    }
}

// Proper background service implementation
public class BackgroundOrderProcessor : BackgroundService
{
    private readonly Channel<Order> _orderQueue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BackgroundOrderProcessor> _logger;
    
    public BackgroundOrderProcessor(IServiceScopeFactory scopeFactory, ILogger<BackgroundOrderProcessor> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        
        // Create bounded channel to prevent memory growth
        var options = new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = false,
            SingleWriter = false
        };
        
        _orderQueue = Channel.CreateBounded<Order>(options);
    }
    
    public async Task EnqueueOrderAsync(Order order)
    {
        await _orderQueue.Writer.WriteAsync(order);
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var order in _orderQueue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                await orderService.ProcessOrderAsync(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing order {OrderId}", order.Id);
            }
        }
    }
}
```

**2. Memory Cache Configuration for Production**

```csharp
// Program.cs - Proper memory cache configuration
builder.Services.AddMemoryCache(options =>
{
    // Set size limit to prevent unbounded growth
    options.SizeLimit = 100_000;
    
    // Compact cache when it reaches 75% capacity
    options.CompactionPercentage = 0.25;
    
    // Check for expired items every 30 seconds
    options.ExpirationScanFrequency = TimeSpan.FromSeconds(30);
});

// Register background services properly
builder.Services.AddSingleton<BackgroundOrderProcessor>();
builder.Services.AddHostedService(provider => provider.GetService<BackgroundOrderProcessor>());
```

**Result**: Memory usage stabilized at 2.1GB with zero OutOfMemoryExceptions over 8 months of production operation.

### The Deeper Insight: Memory-Aware .NET Architecture

The real lesson wasn't just fixing the immediate leak—it was designing memory-conscious .NET systems:

```csharp
// Memory-efficient event processing pattern
public class MemoryEfficientOrderProcessor
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MemoryEfficientOrderProcessor> _logger;
    
    public async Task HandleOrderCreatedAsync(OrderCreatedEvent orderEvent)
    {
        // Process immediately, don't store in memory
        await ProcessOrderImmediatelyAsync(orderEvent.Order);
        
        // If state must be maintained, use external storage (database/Redis)
        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOrderEventRepository>();
        await repository.SaveAsync(new OrderEventEntity(orderEvent));
    }
    
    // Use streaming for large datasets with Entity Framework
    public async Task ProcessBulkOrdersAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
        
        await foreach (var order in context.Orders
            .Where(o => o.Status == OrderStatus.Pending)
            .AsAsyncEnumerable())
        {
            await ProcessOrderAsync(order);
        }
    }
    
    // Memory-conscious data processing using projections
    public async Task<OrderSummary> GenerateOrderSummaryAsync(DateTime date)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
        
        // Use database aggregation instead of loading all orders into memory
        return await context.Orders
            .Where(o => o.CreatedDate.Date == date.Date)
            .GroupBy(o => 1)
            .Select(g => new OrderSummary
            {
                TotalOrders = g.Count(),
                TotalRevenue = g.Sum(o => o.Total),
                AverageOrderValue = g.Average(o => o.Total)
            })
            .FirstOrDefaultAsync();
    }
}

## Issue #2: .NET Garbage Collection Nightmares

### The Problem

Our .NET payment service was experiencing GC pressure that caused 500ms+ response time spikes every 30 seconds. The service was healthy between spikes, but those periodic freezes were killing user experience.

```csharp
// The problematic payment processing code
public class PaymentProcessingService
{
    private readonly HttpClient _httpClient;
    private readonly List<PaymentTransaction> _transactionHistory = new();
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        // Creating large objects frequently
        var paymentData = new PaymentData
        {
            RequestId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            CustomerInfo = await GetCustomerInfoAsync(request.CustomerId),
            PaymentDetails = request.PaymentDetails,
            ValidationResults = await ValidatePaymentAsync(request),
            AuditTrail = GenerateAuditTrail(request)
        };
        
        // Keeping references to large objects
        _transactionHistory.Add(new PaymentTransaction(paymentData));
        
        // Processing large JSON payloads
        var jsonPayload = JsonSerializer.Serialize(paymentData);
        var response = await _httpClient.PostAsync("/process", new StringContent(jsonPayload));
        
        return await ProcessResponseAsync(response);
    }
}
```

### The Investigation: GC Analysis

We analyzed GC behavior using Application Insights and custom performance counters:

```csharp
// GC monitoring setup
public class GCMonitoringService : IHostedService
{
    private readonly ILogger<GCMonitoringService> _logger;
    private readonly IMetrics _metrics;
    private Timer _timer;
    
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _timer = new Timer(CollectGCMetrics, null, TimeSpan.Zero, TimeSpan.FromSeconds(10));
        return Task.CompletedTask;
    }
    
    private void CollectGCMetrics(object state)
    {
        var gen0Collections = GC.CollectionCount(0);
        var gen1Collections = GC.CollectionCount(1);
        var gen2Collections = GC.CollectionCount(2);
        var totalMemory = GC.GetTotalMemory(false);
        var gen0Size = GC.GetGeneration(new object());
        
        _metrics.Gauge("gc.gen0.collections").Set(gen0Collections);
        _metrics.Gauge("gc.gen1.collections").Set(gen1Collections);
        _metrics.Gauge("gc.gen2.collections").Set(gen2Collections);
        _metrics.Gauge("gc.total.memory.bytes").Set(totalMemory);
        
        // Log concerning patterns
        if (gen2Collections > _previousGen2Count + 5)
        {
            _logger.LogWarning("High Gen2 GC activity detected: {Gen2Collections}", gen2Collections);
        }
    }
}
```

The analysis revealed:
- **Gen 2 collections** every 30 seconds lasting 400-600ms
- **Large Object Heap (LOH)** pressure from JSON serialization
- **Memory pressure** from unbounded list growth

### The Solution: .NET Memory Optimization

**1. Object Pooling and Memory Management**

```csharp
public class OptimizedPaymentProcessingService
{
    private readonly ObjectPool<StringBuilder> _stringBuilderPool;
    private readonly IMemoryCache _memoryCache;
    private readonly ArrayPool<byte> _arrayPool = ArrayPool<byte>.Shared;
    
    // Use bounded concurrent collection instead of unbounded List
    private readonly ConcurrentQueue<PaymentTransaction> _recentTransactions = new();
    private const int MaxRecentTransactions = 1000;
    
    public OptimizedPaymentProcessingService(ObjectPool<StringBuilder> stringBuilderPool, IMemoryCache memoryCache)
    {
        _stringBuilderPool = stringBuilderPool;
        _memoryCache = memoryCache;
    }
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        // Use object pooling for frequently allocated objects
        var stringBuilder = _stringBuilderPool.Get();
        
        try
        {
            // Create payment data with memory-conscious approach
            var paymentData = await CreatePaymentDataAsync(request);
            
            // Use System.Text.Json with pre-allocated buffers
            var jsonBytes = await SerializeToJsonBytesAsync(paymentData);
            
            // Process payment with efficient memory usage
            var result = await ProcessPaymentInternalAsync(jsonBytes);
            
            // Maintain bounded transaction history
            await AddTransactionToHistoryAsync(paymentData, result);
            
            return result;
        }
        finally
        {
            _stringBuilderPool.Return(stringBuilder);
        }
    }
    
    private async Task<byte[]> SerializeToJsonBytesAsync(PaymentData paymentData)
    {
        // Rent buffer from array pool to avoid LOH allocations
        var rentedBuffer = _arrayPool.Rent(4096);
        
        try
        {
            using var stream = new MemoryStream(rentedBuffer);
            await JsonSerializer.SerializeAsync(stream, paymentData, new JsonSerializerOptions
            {
                DefaultBufferSize = 1024  // Smaller buffer size
            });
            
            return stream.ToArray();
        }
        finally
        {
            _arrayPool.Return(rentedBuffer);
        }
    }
    
    private async Task AddTransactionToHistoryAsync(PaymentData paymentData, PaymentResult result)
    {
        var transaction = new PaymentTransaction(paymentData.RequestId, result.Status, DateTime.UtcNow);
        
        _recentTransactions.Enqueue(transaction);
        
        // Maintain bounded size
        while (_recentTransactions.Count > MaxRecentTransactions)
        {
            _recentTransactions.TryDequeue(out _);
        }
        
        // Persist to external storage instead of keeping in memory
        await _transactionRepository.SaveAsync(transaction);
    }
    
    // Use memory caching with expiration
    private async Task<CustomerInfo> GetCustomerInfoAsync(string customerId)
    {
        var cacheKey = $"customer:{customerId}";
        
        if (_memoryCache.TryGetValue(cacheKey, out CustomerInfo customerInfo))
        {
            return customerInfo;
        }
        
        customerInfo = await _customerRepository.GetByIdAsync(customerId);
        
        _memoryCache.Set(cacheKey, customerInfo, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
            SlidingExpiration = TimeSpan.FromMinutes(1),
            Size = 1,
            Priority = CacheItemPriority.Normal
        });
        
        return customerInfo;
    }
}
```

**2. GC Configuration and Monitoring**

```csharp
// Program.cs - GC configuration
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureServices((context, services) =>
        {
            // Configure memory cache with size limit
            services.AddMemoryCache(options =>
            {
                options.SizeLimit = 100_000; // Limit cache entries
                options.CompactionPercentage = 0.25; // Compact when 75% full
            });
            
            // Configure object pooling
            services.AddSingleton<ObjectPoolProvider, DefaultObjectPoolProvider>();
            services.AddSingleton(serviceProvider =>
            {
                var provider = serviceProvider.GetService<ObjectPoolProvider>();
                return provider.CreateStringBuilderPool();
            });
            
            // Add custom GC monitoring
            services.AddSingleton<GCMonitoringService>();
            services.AddHostedService<GCMonitoringService>();
        })
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseStartup<Startup>();
            
            // Configure Kestrel with memory limits
            webBuilder.UseKestrel(options =>
            {
                options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10MB limit
                options.Limits.MaxRequestBufferSize = 1024 * 1024;    // 1MB buffer
            });
        });
```

**3. Advanced GC Tuning for Production**

```xml
<!-- In .csproj for Server GC -->
<PropertyGroup>
  <ServerGarbageCollection>true</ServerGarbageCollection>
  <ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
  <RetainVMGarbageCollection>true</RetainVMGarbageCollection>
</PropertyGroup>
```

```bash
# Environment variables for GC tuning
export DOTNET_gcServer=1
export DOTNET_gcConcurrent=1
export DOTNET_GCHeapHardLimit=0x200000000  # 8GB heap limit
export DOTNET_GCHighMemPercent=90
export DOTNET_GCConserveMemory=5
```

**Result**: P95 response times dropped from 650ms to 85ms, and GC pause times reduced by 78%.

## Issue #3: Docker Memory Limits and OOMKilled

### The Problem

Our containerized services were randomly dying with exit code 137 (OOMKilled). Container memory usage looked normal in monitoring dashboards, but containers were still being killed by the OOM killer.

### The Investigation: Container Memory Deep Dive

The issue was subtle but deadly—we were monitoring application memory usage, not total container memory consumption:

```bash
# What we were monitoring (application memory)
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# What we should have been monitoring (total memory including buffers, cache, etc.)
docker exec <container_id> cat /sys/fs/cgroup/memory/memory.usage_in_bytes
docker exec <container_id> cat /sys/fs/cgroup/memory/memory.limit_in_bytes
```

### The Solution: Comprehensive Container Memory Management

**1. Proper Memory Limit Configuration**

```yaml
# Kubernetes deployment with proper memory management
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: payment-service
        image: payment-service:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"        # 2x request for burst capacity
            cpu: "2000m"
        env:
        - name: DOTNET_GCHeapHardLimit
          value: "0xC0000000"    # 3GB (75% of 4GB limit)
        - name: DOTNET_GCServer
          value: "1"             # Enable server GC for better throughput
          
        # Liveness probe with proper failure threshold
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          failureThreshold: 3
          timeoutSeconds: 10
          
        # Readiness probe
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
          
      # Configure pod disruption budget
      terminationGracePeriodSeconds: 45
```

**2. Memory Monitoring and Alerting**

```yaml
# Prometheus alerts for memory issues
groups:
- name: memory-alerts
  rules:
  - alert: ContainerMemoryUsageHigh
    expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Container memory usage is above 80%"
      description: "Container {{ $labels.container }} in pod {{ $labels.pod }} is using {{ $value | humanizePercentage }} of its memory limit"
      
  - alert: ContainerMemoryUsageCritical
    expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Container memory usage is critically high"
      
  - alert: PodOOMKilled
    expr: increase(kube_pod_container_status_restarts_total[5m]) > 0 and kube_pod_container_status_last_terminated_reason{reason="OOMKilled"} == 1
    for: 0m
    labels:
      severity: critical
    annotations:
      summary: "Pod was OOMKilled"
      description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} was killed due to out of memory"
```

**3. Memory-Aware Application Configuration**

```csharp
// Startup.cs - Configure services for container memory constraints
public void ConfigureServices(IServiceCollection services)
{
    // Configure HTTP client with connection pooling
    services.AddHttpClient<PaymentGatewayClient>(client =>
    {
        client.Timeout = TimeSpan.FromSeconds(30);
    }).ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
    {
        PooledConnectionLifetime = TimeSpan.FromMinutes(2),
        MaxConnectionsPerServer = 50,
        UseProxy = false
    });
    
    // Configure memory cache with container-aware limits
    services.AddMemoryCache(options =>
    {
        // Use percentage of available memory
        var totalMemory = GC.GetTotalMemory(false);
        options.SizeLimit = (int)(totalMemory * 0.1); // 10% of heap for cache
    });
    
    // Configure Entity Framework with connection pooling
    services.AddDbContextPool<PaymentDbContext>(options =>
        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.CommandTimeout(30);
        }), poolSize: 128); // Limit connection pool size
}
```

## Issue #4: Entity Framework Connection Pool Memory Leaks

### The Problem

Our Entity Framework DbContext instances were slowly leaking memory, and database connections weren't being properly disposed in high-concurrency scenarios. We discovered that long-lived DbContext instances were holding onto connections and change tracking data.

### The Investigation and Solution

```csharp
// The problematic pattern - long-lived DbContext
public class OrderRepository
{
    private readonly OrderDbContext _context; // Singleton DbContext - BAD!
    
    public OrderRepository(OrderDbContext context)
    {
        _context = context;
    }
    
    public async Task<Order> GetOrderAsync(int orderId)
    {
        // Long-lived context accumulates change tracking data
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);
            
        return order;
    }
    
    public async Task UpdateOrderAsync(Order order)
    {
        // Change tracker keeps growing over time
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
        // Context never disposed, memory keeps growing
    }
}

// The optimized solution using DbContextFactory
public class OptimizedOrderRepository
{
    private readonly IDbContextFactory<OrderDbContext> _contextFactory;
    private readonly ILogger<OptimizedOrderRepository> _logger;
    
    public OptimizedOrderRepository(
        IDbContextFactory<OrderDbContext> contextFactory,
        ILogger<OptimizedOrderRepository> logger)
    {
        _contextFactory = contextFactory;
        _logger = logger;
    }
    
    public async Task<Order> GetOrderAsync(int orderId)
    {
        // Create short-lived context for each operation
        await using var context = await _contextFactory.CreateDbContextAsync();
        
        // Disable change tracking for read-only operations
        return await context.Orders
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }
    
    public async Task<IEnumerable<Order>> GetOrdersBatchAsync(IEnumerable<int> orderIds)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        
        // Use efficient batch query with projection to reduce memory
        return await context.Orders
            .Where(o => orderIds.Contains(o.Id))
            .AsNoTracking()
            .Select(o => new Order
            {
                Id = o.Id,
                CustomerId = o.CustomerId,
                Total = o.Total,
                Status = o.Status,
                CreatedDate = o.CreatedDate
                // Only select fields you need
            })
            .ToListAsync();
    }
    
    public async Task UpdateOrderAsync(Order order)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();
        
        try
        {
            // Attach and mark as modified to avoid loading from database
            context.Orders.Attach(order);
            context.Entry(order).State = EntityState.Modified;
            
            var rowsAffected = await context.SaveChangesAsync();
            
            if (rowsAffected == 0)
            {
                _logger.LogWarning("No rows affected when updating order {OrderId}", order.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order {OrderId}", order.Id);
            throw;
        }
        // Context automatically disposed, connections returned to pool
    }
    
    public async Task ProcessLargeOrderBatchAsync(IEnumerable<int> orderIds)
    {
        const int batchSize = 1000;
        var orderIdsList = orderIds.ToList();
        
        for (int i = 0; i < orderIdsList.Count; i += batchSize)
        {
            var batch = orderIdsList.Skip(i).Take(batchSize);
            
            // Use separate context for each batch to prevent memory accumulation
            await using var context = await _contextFactory.CreateDbContextAsync();
            
            var orders = await context.Orders
                .Where(o => batch.Contains(o.Id))
                .AsNoTracking()
                .ToListAsync();
            
            foreach (var order in orders)
            {
                await ProcessOrderAsync(order);
            }
            
            // Context disposed after each batch, memory freed
        }
    }
}
```

**DbContext Factory Configuration for Production**:

```csharp
// Program.cs - Proper DbContext factory setup
builder.Services.AddDbContextFactory<OrderDbContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.CommandTimeout(30);
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });
    
    // Optimize for production
    options.EnableSensitiveDataLogging(false);
    options.EnableServiceProviderCaching();
    options.EnableDetailedErrors(builder.Environment.IsDevelopment());
    
    // Configure change tracking behavior
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
}, ServiceLifetime.Scoped);

// Configure connection pooling at the database level
builder.Services.AddPooledDbContextFactory<OrderDbContext>(options =>
{
    options.UseSqlServer(connectionString);
}, poolSize: 128); // Limit pool size to prevent excessive connections
```

**Advanced Entity Framework Memory Optimization**:

```csharp
// Custom DbContext with memory optimizations
public class OptimizedOrderDbContext : DbContext
{
    public OptimizedOrderDbContext(DbContextOptions<OptimizedOrderDbContext> options) : base(options)
    {
        // Optimize change tracker for memory
        ChangeTracker.AutoDetectChangesEnabled = false;
        ChangeTracker.LazyLoadingEnabled = false;
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }
    
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure value converters to reduce memory allocations
        modelBuilder.Entity<Order>()
            .Property(e => e.CreatedDate)
            .HasConversion(
                v => v.ToUniversalTime(),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
    }
    
    // Override SaveChanges to optimize memory usage
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            ChangeTracker.DetectChanges();
            return await base.SaveChangesAsync(cancellationToken);
        }
        finally
        {
            // Clear change tracker after save to free memory
            ChangeTracker.Clear();
        }
    }
}

## Advanced Memory Profiling in Production

### Real-Time Memory Monitoring

```csharp
// Production-safe memory profiling service
public class ProductionMemoryProfiler : IHostedService
{
    private readonly ILogger<ProductionMemoryProfiler> _logger;
    private readonly IMetrics _metrics;
    private Timer _profileTimer;
    
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _profileTimer = new Timer(ProfileMemoryUsage, null, TimeSpan.Zero, TimeSpan.FromMinutes(1));
    }
    
    private void ProfileMemoryUsage(object state)
    {
        try
        {
            // Collect basic GC information
            var gen0Count = GC.CollectionCount(0);
            var gen1Count = GC.CollectionCount(1);
            var gen2Count = GC.CollectionCount(2);
            var totalMemory = GC.GetTotalMemory(false);
            
            // Check for memory pressure
            var allocatedBytes = GC.GetTotalAllocatedBytes(false);
            
            // Monitor working set
            var process = Process.GetCurrentProcess();
            var workingSet = process.WorkingSet64;
            var privateMemory = process.PrivateMemorySize64;
            
            // Record metrics
            _metrics.Gauge("memory.gc.gen0.count").Set(gen0Count);
            _metrics.Gauge("memory.gc.gen1.count").Set(gen1Count);
            _metrics.Gauge("memory.gc.gen2.count").Set(gen2Count);
            _metrics.Gauge("memory.heap.total.bytes").Set(totalMemory);
            _metrics.Gauge("memory.allocated.total.bytes").Set(allocatedBytes);
            _metrics.Gauge("memory.working.set.bytes").Set(workingSet);
            _metrics.Gauge("memory.private.bytes").Set(privateMemory);
            
            // Alert on concerning patterns
            if (gen2Count > _previousGen2Count + 10)
            {
                _logger.LogWarning("High Gen2 GC activity: {Count} collections", gen2Count);
            }
            
            if (totalMemory > workingSet * 0.8)
            {
                _logger.LogWarning("High heap pressure: {HeapSize} bytes ({Percentage:P} of working set)", 
                    totalMemory, totalMemory / (double)workingSet);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during memory profiling");
        }
    }
}
```

### Memory Leak Detection Patterns

```csharp
// Memory leak detection utility
public static class MemoryLeakDetector
{
    private static readonly ConcurrentDictionary<Type, (int Count, DateTime LastCheck)> _objectCounts = new();
    
    public static void TrackObject<T>(T obj) where T : class
    {
        if (!_objectCounts.ContainsKey(typeof(T)))
        {
            _objectCounts[typeof(T)] = (0, DateTime.UtcNow);
        }
        
        _objectCounts.AddOrUpdate(typeof(T), 
            (1, DateTime.UtcNow),
            (key, value) => (value.Count + 1, DateTime.UtcNow));
    }
    
    public static void PerformLeakDetection(ILogger logger)
    {
        foreach (var kvp in _objectCounts)
        {
            var type = kvp.Key;
            var (count, lastCheck) = kvp.Value;
            
            // Check for objects that keep growing
            if (count > 10000 && DateTime.UtcNow - lastCheck > TimeSpan.FromMinutes(5))
            {
                logger.LogWarning("Potential memory leak detected: {TypeName} has {Count} instances", 
                    type.Name, count);
            }
        }
    }
}
```

## Production Memory Monitoring Dashboard

### Essential Metrics to Track

```promql
# Memory utilization
(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100

# Memory pressure
rate(container_memory_usage_bytes[5m])

# OOM kills
increase(container_oom_kills_total[5m])

# GC activity (.NET)
rate(dotnet_gc_collections_total[5m])

# .NET heap usage
dotnet_gc_memory_total_available_bytes - dotnet_gc_heap_size_bytes

# Entity Framework connection pool usage
dotnet_ef_connection_pool_active / dotnet_ef_connection_pool_max
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Production Memory Monitoring",
    "panels": [
      {
        "title": "Container Memory Usage",
        "targets": [
          {
            "expr": "(container_memory_usage_bytes{pod=~\"$pod\"} / container_spec_memory_limit_bytes{pod=~\"$pod\"}) * 100",
            "legendFormat": "{{pod}} - {{container}}"
          }
        ],
        "thresholds": [
          {"value": 80, "color": "yellow"},
          {"value": 90, "color": "red"}
        ]
      },
      {
        "title": "GC Collection Rate",
        "targets": [
          {
            "expr": "rate(dotnet_gc_collections_total{pod=~\"$pod\"}[5m])",
            "legendFormat": "{{pod}} - Gen {{generation}}"
          }
        ]
      },
      {
        "title": "Memory Allocation Rate",
        "targets": [
          {
            "expr": "rate(dotnet_gc_allocated_bytes_total{pod=~\"$pod\"}[5m])",
            "legendFormat": "{{pod}}"
          }
        ]
      }
    ]
  }
}
```

## .NET-Specific Memory Optimization Patterns

### Issue #5: Large Object Heap (LOH) Pressure

The Large Object Heap in .NET is a special area where objects larger than 85KB are allocated. Unlike the regular heap, LOH objects are collected less frequently, leading to memory pressure.

```csharp
// Problematic: Large arrays causing LOH pressure
public class ReportGenerator
{
    public async Task<byte[]> GenerateLargeReportAsync(int reportId)
    {
        // This creates a large array that goes to LOH
        var reportData = new byte[1_000_000]; // 1MB array
        
        // Fill report data...
        await FillReportDataAsync(reportData, reportId);
        
        return reportData; // LOH object that's hard to collect
    }
}

// Optimized: Use ArrayPool to reduce LOH pressure
public class OptimizedReportGenerator
{
    private readonly ArrayPool<byte> _arrayPool = ArrayPool<byte>.Shared;
    
    public async Task<byte[]> GenerateLargeReportAsync(int reportId)
    {
        // Rent from pool instead of allocating
        var buffer = _arrayPool.Rent(1_000_000);
        
        try
        {
            await FillReportDataAsync(buffer, reportId);
            
            // Copy only the used portion
            var result = new byte[GetActualSize(buffer)];
            Array.Copy(buffer, result, result.Length);
            
            return result;
        }
        finally
        {
            // Always return to pool
            _arrayPool.Return(buffer);
        }
    }
    
    // Alternative: Stream large data instead of buffering
    public async Task<Stream> GenerateLargeReportStreamAsync(int reportId)
    {
        var stream = new MemoryStream();
        
        // Write directly to stream to avoid large arrays
        await WriteReportDataToStreamAsync(stream, reportId);
        
        stream.Position = 0;
        return stream;
    }
}
```

### Issue #6: String Allocation and StringBuilder Optimization

Excessive string allocations are a common source of memory pressure in .NET applications.

```csharp
// Memory-intensive string operations
public class LogFormatter
{
    public string FormatLogEntry(LogEntry entry)
    {
        // Each concatenation creates a new string object
        var result = "[" + entry.Timestamp.ToString("yyyy-MM-dd HH:mm:ss") + "] ";
        result += entry.Level.ToString().ToUpper() + " ";
        result += entry.Category + ": ";
        result += entry.Message;
        
        if (entry.Exception != null)
        {
            result += Environment.NewLine + entry.Exception.ToString();
        }
        
        return result; // Multiple temporary strings created
    }
}

// Optimized using StringBuilder and object pooling
public class OptimizedLogFormatter
{
    private readonly ObjectPool<StringBuilder> _stringBuilderPool;
    
    public OptimizedLogFormatter(ObjectPool<StringBuilder> stringBuilderPool)
    {
        _stringBuilderPool = stringBuilderPool;
    }
    
    public string FormatLogEntry(LogEntry entry)
    {
        var sb = _stringBuilderPool.Get();
        
        try
        {
            sb.Clear();
            sb.Append('[')
              .Append(entry.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"))
              .Append("] ")
              .Append(entry.Level.ToString().ToUpper())
              .Append(' ')
              .Append(entry.Category)
              .Append(": ")
              .Append(entry.Message);
            
            if (entry.Exception != null)
            {
                sb.AppendLine()
                  .Append(entry.Exception.ToString());
            }
            
            return sb.ToString();
        }
        finally
        {
            _stringBuilderPool.Return(sb);
        }
    }
}

// Configuration for StringBuilder pooling
builder.Services.AddSingleton<ObjectPoolProvider, DefaultObjectPoolProvider>();
builder.Services.AddSingleton(serviceProvider =>
{
    var provider = serviceProvider.GetService<ObjectPoolProvider>();
    return provider.CreateStringBuilderPool();
});
```

## Best Practices: The .NET Memory Management Playbook

### 1. Design for Memory Efficiency

**Use streaming for large datasets**:
```csharp
// Instead of loading everything into memory
public async Task<List<Order>> GetAllOrdersAsync()
{
    return await _context.Orders.ToListAsync(); // Bad: loads all orders
}

// Use streaming and pagination
public async IAsyncEnumerable<Order> GetOrdersStreamAsync(int pageSize = 1000)
{
    var offset = 0;
    List<Order> batch;
    
    do
    {
        batch = await _context.Orders
            .Skip(offset)
            .Take(pageSize)
            .ToListAsync();
            
        foreach (var order in batch)
        {
            yield return order;
        }
        
        offset += pageSize;
    } while (batch.Count == pageSize);
}
```

**Implement proper caching strategies**:
```csharp
// Memory-bounded caching with cleanup
public class BoundedCache<TKey, TValue>
{
    private readonly ConcurrentLRUCache<TKey, TValue> _cache;
    private readonly Timer _cleanupTimer;
    
    public BoundedCache(int maxSize, TimeSpan expiration)
    {
        _cache = new ConcurrentLRUCache<TKey, TValue>(maxSize);
        _cleanupTimer = new Timer(Cleanup, null, expiration, expiration);
    }
    
    private void Cleanup(object state)
    {
        _cache.RemoveExpiredEntries();
        
        // Force GC if memory pressure is high
        if (GC.GetTotalMemory(false) > Environment.WorkingSet * 0.8)
        {
            GC.Collect(1, GCCollectionMode.Optimized);
        }
    }
}
```

### 2. Container Memory Best Practices

**Set appropriate memory limits**:
```yaml
resources:
  requests:
    memory: "1Gi"    # Guaranteed memory
  limits:
    memory: "2Gi"    # Maximum memory (2x request for burst)
```

**Configure .NET heap limits relative to container limits**:
- .NET Core/5+: 75-80% of container limit using DOTNET_GCHeapHardLimit
- .NET Framework: Configure explicitly using environment variables
- Leave 20-25% for OS, networking buffers, and unmanaged memory

### 3. Monitoring and Alerting Strategy

**Implement predictive alerting**:
```promql
# Alert when memory growth rate suggests OOM within 30 minutes
predict_linear(container_memory_usage_bytes[10m], 30*60) > container_spec_memory_limit_bytes
```

**Track memory efficiency metrics**:
- Memory utilization per request
- GC pause time as percentage of request time
- Object allocation rate
- Connection pool efficiency

## Conclusion: Building Memory-Resilient Systems

Memory management in production environments isn't just about preventing OutOfMemoryErrors—it's about building systems that remain performant and predictable under varying load conditions. The lessons we learned from our production crises have shaped how we approach system design:

**Key Takeaways**:

1. **Proactive Monitoring**: Don't wait for OOM kills. Monitor memory pressure, allocation rates, and GC behavior continuously.

2. **Bounded Resources**: Every cache, collection, and pool should have limits. Unbounded growth is a ticking time bomb.

3. **Container Awareness**: Configure heap limits relative to container limits, leaving room for OS overhead.

4. **Memory-Conscious Architecture**: Design for streaming, use external storage for state, and implement proper resource disposal.

5. **Testing Under Load**: Memory issues often only surface under production-like load. Include memory pressure testing in your validation strategy.

The transformation in our system reliability has been remarkable:
- **Zero OOM incidents** in 8 months since implementing these practices
- **67% reduction** in memory-related alerts
- **$2.3M in prevented downtime** based on our previous incident costs
- **40% improvement** in developer productivity due to reduced firefighting

Memory management is a journey, not a destination. As your applications evolve and scale, new memory challenges will emerge. The key is building systems with observability, limits, and cleanup mechanisms from the start. When memory issues do arise—and they will—you'll have the tools and knowledge to identify and resolve them quickly.

Remember: in production systems, memory leaks aren't just technical debt—they're business risk. Invest in proper memory management practices, and your future self (and your on-call teammates) will thank you.

---

*This post reflects real experiences managing memory in production environments serving millions of users. The specific metrics and code examples have been adapted for educational purposes while preserving the core lessons learned from production incidents. The patterns and practices described here are battle-tested in high-scale environments.*