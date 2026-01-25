// Performance Optimizations
// Phase 4: Critical CSS strategy and performance improvements

$(document).ready(function() {
    initPerformanceOptimizations();
});

function initPerformanceOptimizations() {
    console.log('🚀 Performance optimizations initialized');
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Lazy load non-critical CSS
    loadNonCriticalCSS();
    
    // Optimize images
    optimizeImages();
    
    // Monitor Web Vitals
    monitorWebVitals();
    
    // Implement resource hints
    implementResourceHints();
    
    // Reduce layout shift
    reduceLayoutShift();
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        { href: '/assets/css/global.css', as: 'style' },
        { href: '/assets/css/developer-theme.css', as: 'style' }
    ];
    
    criticalResources.forEach(resource => {
        if (!document.querySelector(`link[href="${resource.href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        }
    });
}

// Load non-critical CSS asynchronously
function loadNonCriticalCSS() {
    const nonCriticalCSS = [
        '/assets/css/enhanced-animations.css',
        '/assets/css/advanced-interactions.css',
        '/assets/css/search.css',
        '/assets/css/syntax-highlighting.css'
    ];
    
    // Use requestIdleCallback to load during idle time
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            nonCriticalCSS.forEach(loadCSSAsync);
        });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            nonCriticalCSS.forEach(loadCSSAsync);
        }, 100);
    }
}

function loadCSSAsync(href) {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (!existing || existing.rel !== 'stylesheet') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() {
            this.media = 'all';
        };
        document.head.appendChild(link);
    }
}

// Optimize images with lazy loading and proper sizing
function optimizeImages() {
    // Add loading="lazy" to images below the fold
    const images = document.querySelectorAll('img:not([loading])');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.setAttribute('loading', 'lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => {
            // Skip images in viewport
            const rect = img.getBoundingClientRect();
            if (rect.top > window.innerHeight + 50) {
                imageObserver.observe(img);
            }
        });
    }
    
    // Add proper sizing attributes
    $('img').each(function() {
        const img = $(this);
        if (!img.attr('width') || !img.attr('height')) {
            img.on('load', function() {
                if (!img.attr('width')) img.attr('width', this.naturalWidth);
                if (!img.attr('height')) img.attr('height', this.naturalHeight);
            });
        }
    });
}

// Monitor Core Web Vitals
function monitorWebVitals() {
    if ('web-vitals' in window) {
        // This would require importing the web-vitals library
        return;
    }
    
    // Basic performance monitoring
    if ('PerformanceObserver' in window) {
        // Monitor Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('🎯 LCP:', lastEntry.startTime.toFixed(2) + 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Monitor First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('⚡ FID:', entry.processingStart - entry.startTime + 'ms');
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    console.log('📏 CLS:', clsValue.toFixed(4));
                }
            });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
    
    // Monitor Time to First Byte (TTFB)
    window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const ttfb = navigation.responseStart - navigation.requestStart;
            console.log('🌐 TTFB:', ttfb.toFixed(2) + 'ms');
        }
    });
}

// Implement resource hints
function implementResourceHints() {
    // DNS prefetch for external domains
    const externalDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com'
    ];
    
    externalDomains.forEach(domain => {
        if (!document.querySelector(`link[href="//${domain}"][rel="dns-prefetch"]`)) {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        }
    });
    
    // Preconnect to critical third-party origins
    const criticalOrigins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
    
    criticalOrigins.forEach(origin => {
        if (!document.querySelector(`link[href="${origin}"][rel="preconnect"]`)) {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = origin;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    });
}

// Reduce layout shift
function reduceLayoutShift() {
    // Reserve space for images
    $('img[data-src]').each(function() {
        const img = $(this);
        const aspectRatio = img.data('aspect-ratio') || '16:9';
        const [width, height] = aspectRatio.split(':');
        
        img.css({
            aspectRatio: `${width} / ${height}`,
            width: '100%',
            height: 'auto'
        });
    });
    
    // Reserve space for dynamic content
    $('.dynamic-content').each(function() {
        const container = $(this);
        if (!container.css('min-height')) {
            container.css('min-height', '200px');
        }
    });
    
    // Prevent layout shift from web fonts
    if ('fonts' in document) {
        document.fonts.ready.then(() => {
            document.body.classList.add('fonts-loaded');
        });
    }
}

// Service worker update handling
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
            // Handle cache updates efficiently
            console.log('📦 Cache updated, new content available');
        }
    });
}

// Optimize JavaScript execution
function optimizeJavaScript() {
    // Debounce scroll events
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    window.onscroll = function(event) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (originalScrollHandler) originalScrollHandler(event);
        }, 16); // ~60fps
    };
    
    // Passive event listeners for better scroll performance
    document.addEventListener('scroll', function() {
        // Scroll handling
    }, { passive: true });
    
    document.addEventListener('touchstart', function() {
        // Touch handling
    }, { passive: true });
}

// Initialize optimizations
optimizeJavaScript();

// Export performance utilities
window.PerformanceOptimizations = {
    preloadCriticalResources,
    loadNonCriticalCSS,
    monitorWebVitals,
    reduceLayoutShift
};