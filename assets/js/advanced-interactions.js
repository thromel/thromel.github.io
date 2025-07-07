// Advanced Interactions and Micro-animations
// Phase 3: Progressive Web App Features & Advanced Micro-interactions

$(document).ready(function() {
    initAdvancedInteractions();
});

function initAdvancedInteractions() {
    // Initialize all advanced interaction features
    initMagneticButtons();
    initCardTiltEffects();
    initParallaxScrolling();
    initAdvancedNavigation();
    initScrollTriggeredAnimations();
    initAdvancedFormFields();
    initPageTransitions();
    initParticleEffects();
    
    console.log('🎨 Advanced interactions initialized');
}


// Magnetic button effects
function initMagneticButtons() {
    $('.btn-primary, .btn-secondary, .project-action-btn').addClass('btn-magnetic btn-ripple gpu-accelerated');
    
    $('.btn-magnetic').on('mouseenter', function(e) {
        const btn = $(this);
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        btn.css({
            '--x': x + 'px',
            '--y': y + 'px'
        });
    });
    
    $('.btn-magnetic').on('mousemove', function(e) {
        const btn = $(this);
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.css('transform', `perspective(1px) translateZ(0) translate(${x * 0.1}px, ${y * 0.1}px) translateY(-2px)`);
    });
    
    $('.btn-magnetic').on('mouseleave', function() {
        $(this).css('transform', 'perspective(1px) translateZ(0)');
    });
}

// Card tilt effects using mouse movement
function initCardTiltEffects() {
    $('.card-interactive, .project-card-enhanced').addClass('card-tilt gpu-accelerated');
    
    $('.card-tilt').on('mouseenter', function() {
        $(this).addClass('card-reveal');
    });
    
    $('.card-tilt').on('mousemove', function(e) {
        const card = $(this);
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);
        
        const rotateX = deltaY * -5; // Max 5 degrees
        const rotateY = deltaX * 5;
        
        card.css('transform', `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    });
    
    $('.card-tilt').on('mouseleave', function() {
        $(this).css('transform', 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        $(this).removeClass('card-reveal');
    });
}

// Parallax scrolling effects
function initParallaxScrolling() {
    const parallaxElements = $('.parallax-element, .morphing-bg, h1, h2, h3');
    
    if (parallaxElements.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        $(window).on('scroll', throttle(function() {
            const scrolled = $(window).scrollTop();
            const windowHeight = $(window).height();
            
            parallaxElements.each(function() {
                const element = $(this);
                const elementTop = element.offset().top;
                const elementHeight = element.outerHeight();
                const rate = (scrolled - elementTop + windowHeight) / (windowHeight + elementHeight);
                
                if (rate >= 0 && rate <= 1) {
                    const yPos = (rate * 50) - 25; // Parallax range: -25px to +25px
                    element.css('transform', `translate3d(0, ${yPos}px, 0)`);
                }
            });
        }, 16));
    }
}

// Advanced navigation interactions
function initAdvancedNavigation() {
    $('.nav-link').addClass('nav-link-advanced gpu-accelerated');
    
    // Add ripple effect to navigation links
    $('.nav-link-advanced').on('click', function(e) {
        const link = $(this);
        const ripple = $('<span class="ripple"></span>');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.css({
            width: size,
            height: size,
            left: x,
            top: y,
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear',
            pointerEvents: 'none'
        });
        
        link.append(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}


// Scroll-triggered animations
function initScrollTriggeredAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const element = $(entry.target);
                    
                    // Add staggered animation delay for list items
                    if (element.hasClass('animate-stagger')) {
                        element.find('.animate-item').each(function(index) {
                            setTimeout(() => {
                                $(this).addClass('visible');
                            }, index * 100);
                        });
                    } else {
                        element.addClass('visible scale-on-scroll');
                    }
                    
                    // Add specific animations based on element type
                    if (element.is('h1, h2, h3')) {
                        element.addClass('text-reveal');
                    }
                    
                    if (element.hasClass('card')) {
                        setTimeout(() => {
                            element.addClass('card-floating');
                        }, 300);
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        $('.card, .position-card, .project-card-enhanced, h1, h2, h3, .tech-tag, .btn').each(function() {
            animationObserver.observe(this);
        });
    }
}

// Advanced form field interactions
function initAdvancedFormFields() {
    $('.form-control').each(function() {
        const input = $(this);
        const parent = input.parent();
        
        if (!parent.hasClass('form-field-advanced')) {
            input.wrap('<div class="form-field-advanced"></div>');
            
            const label = $('label[for="' + input.attr('id') + '"]');
            if (label.length) {
                label.appendTo(input.parent());
            }
        }
    });
    
    // Advanced focus effects
    $('.form-field-advanced input, .form-field-advanced textarea').on('focus blur', function() {
        const field = $(this).closest('.form-field-advanced');
        field.toggleClass('focused', $(this).is(':focus'));
    });
}

// Page transition effects
function initPageTransitions() {
    // Create page transition overlay
    const transitionOverlay = $('<div class="page-transition"></div>');
    $('body').append(transitionOverlay);
    
    // Handle internal link clicks
    $('a[href^="/"], a[href^="#"]').not('.no-transition').on('click', function(e) {
        const href = $(this).attr('href');
        
        if (href.startsWith('#')) return; // Skip anchor links
        
        e.preventDefault();
        
        transitionOverlay.addClass('active');
        
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    });
    
    // Hide transition on page load
    $(window).on('load', function() {
        transitionOverlay.removeClass('active');
    });
}

// Particle effects for backgrounds
function initParticleEffects() {
    $('.morphing-bg').each(function() {
        const container = $(this);
        
        // Create floating particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createParticle(container);
            }, i * 1000);
        }
    });
}

function createParticle(container) {
    const particle = $('<div class="particle"></div>');
    const size = Math.random() * 4 + 2;
    const x = Math.random() * container.width();
    const y = container.height() + 10;
    const duration = Math.random() * 3 + 2;
    
    particle.css({
        width: size,
        height: size,
        left: x,
        top: y,
        animationDuration: duration + 's'
    });
    
    container.append(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        particle.remove();
        // Create new particle
        setTimeout(() => {
            createParticle(container);
        }, Math.random() * 2000);
    }, duration * 1000);
}

// Utility functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Typing effect for specific elements
function initTypingEffect(selector, text, speed = 100) {
    const element = $(selector);
    if (!element.length) return;
    
    element.addClass('typewriter').text('');
    
    let i = 0;
    const timer = setInterval(() => {
        element.text(text.slice(0, i + 1));
        i++;
        
        if (i === text.length) {
            clearInterval(timer);
            setTimeout(() => {
                element.removeClass('typewriter');
            }, 1000);
        }
    }, speed);
}

// Performance monitoring
function measureInteractionPerformance() {
    if ('performance' in window && 'measure' in window.performance) {
        // Measure animation frame rate
        let frameCount = 0;
        let lastTime = performance.now();
        
        function countFrames() {
            frameCount++;
            const now = performance.now();
            
            if (now - lastTime >= 1000) {
                console.log(`🎯 Animation FPS: ${frameCount}`);
                frameCount = 0;
                lastTime = now;
            }
            
            requestAnimationFrame(countFrames);
        }
        
        requestAnimationFrame(countFrames);
    }
}

// Initialize performance monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    measureInteractionPerformance();
}

// Export functions for external use
window.AdvancedInteractions = {
    initTypingEffect,
    createParticle,
    throttle
};