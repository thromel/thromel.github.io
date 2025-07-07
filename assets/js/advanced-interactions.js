// Advanced Interactions and Micro-animations
// Phase 3: Progressive Web App Features & Advanced Micro-interactions

$(document).ready(function() {
    initAdvancedInteractions();
});

function initAdvancedInteractions() {
    // Ensure default cursor is always visible first
    ensureDefaultCursorVisible();
    
    // Initialize all advanced interaction features
    initMagneticButtons();
    initCardTiltEffects();
    initParallaxScrolling();
    initAdvancedNavigation();
    
    // Initialize custom cursor with delay to ensure page is fully loaded
    setTimeout(() => {
        initCursorEffects();
    }, 1000);
    
    initScrollTriggeredAnimations();
    initAdvancedFormFields();
    initPageTransitions();
    initParticleEffects();
    
    console.log('🎨 Advanced interactions initialized');
}

// Ensure default cursor is always visible
function ensureDefaultCursorVisible() {
    // Force default cursor styles
    const style = document.createElement('style');
    style.id = 'default-cursor-enforcer';
    style.textContent = `
        /* Enforce default cursor visibility */
        body:not(.custom-cursor-working) {
            cursor: auto !important;
        }
        
        body:not(.custom-cursor-working) a,
        body:not(.custom-cursor-working) button,
        body:not(.custom-cursor-working) .btn,
        body:not(.custom-cursor-working) [role="button"],
        body:not(.custom-cursor-working) [tabindex]:not([tabindex="-1"]) {
            cursor: pointer !important;
        }
        
        body:not(.custom-cursor-working) input:not([readonly]),
        body:not(.custom-cursor-working) textarea:not([readonly]),
        body:not(.custom-cursor-working) select,
        body:not(.custom-cursor-working) [contenteditable="true"] {
            cursor: text !important;
        }
        
        body:not(.custom-cursor-working) [disabled],
        body:not(.custom-cursor-working) [aria-disabled="true"] {
            cursor: not-allowed !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🖱️ Default cursor visibility enforced');
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

// Advanced cursor effects - Complete implementation
function initCursorEffects() {
    // Only initialize on desktop devices
    if (window.innerWidth <= 768) {
        console.log('🖱️ Mobile device detected - skipping custom cursor');
        return;
    }
    
    // Check if custom cursor is supported
    if (!document.body || !window.jQuery) {
        console.warn('⚠️ Custom cursor requirements not met');
        return;
    }
    
    let cursor = null;
    let cursorFollower = null;
    let isInitialized = false;
    let isWorking = false;
    let mouseMovementCount = 0;
    const MOVEMENT_THRESHOLD = 3; // Require 3 mouse movements to confirm working
    
    try {
        // Create cursor elements
        cursor = $('<div class="custom-cursor"></div>');
        cursorFollower = $('<div class="custom-cursor-follower"></div>');
        
        // Append to body
        $('body').append(cursor).append(cursorFollower);
        
        // Test if elements were created successfully
        if (cursor.length === 0 || cursorFollower.length === 0) {
            throw new Error('Failed to create cursor elements');
        }
        
        // Mark as initialized
        $('body').addClass('custom-cursor-initialized');
        isInitialized = true;
        
        // Set initial position (off-screen until mouse moves)
        cursor.css({
            left: '-100px',
            top: '-100px'
        });
        
        cursorFollower.css({
            left: '-100px',
            top: '-100px'
        });
        
        console.log('🖱️ Custom cursor elements created successfully');
        
        // Mouse movement handler
        $(document).on('mousemove.customCursor', function(e) {
            if (!isInitialized) return;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Update cursor positions
            cursor.css({
                left: mouseX - 4,
                top: mouseY - 4
            });
            
            cursorFollower.css({
                left: mouseX - 15,
                top: mouseY - 15
            });
            
            // Track successful mouse movements
            mouseMovementCount++;
            
            // After sufficient movements, mark as working
            if (!isWorking && mouseMovementCount >= MOVEMENT_THRESHOLD) {
                isWorking = true;
                $('body').addClass('custom-cursor-working');
                console.log('🖱️ Custom cursor confirmed working - default cursor now hidden');
                
                // Verify cursor is still visible
                if (!cursor.is(':visible') || cursor.css('opacity') === '0') {
                    console.warn('⚠️ Custom cursor not visible after activation');
                    disableCustomCursor();
                    return;
                }
            }
        });
        
        // Mouse enter/leave handlers
        $(document).on('mouseenter.customCursor', function() {
            if (isInitialized && cursor.length) {
                cursor.css('opacity', '1');
                cursorFollower.css('opacity', '1');
            }
        });
        
        $(document).on('mouseleave.customCursor', function() {
            if (isInitialized && cursor.length) {
                cursor.css('opacity', '0');
                cursorFollower.css('opacity', '0');
            }
        });
        
        // Hover interactions for interactive elements
        $(document).on('mouseenter.customCursor', '.btn, .card, .nav-link, a, button, [role="button"]', function() {
            if (!isWorking || !cursor.length) return;
            
            cursor.css({
                transform: 'scale(2)',
                background: 'var(--accent-secondary, #818cf8)'
            });
            
            cursorFollower.css({
                transform: 'scale(1.5)',
                borderColor: 'var(--accent-secondary, #818cf8)'
            });
        });
        
        $(document).on('mouseleave.customCursor', '.btn, .card, .nav-link, a, button, [role="button"]', function() {
            if (!isWorking || !cursor.length) return;
            
            cursor.css({
                transform: 'scale(1)',
                background: 'var(--accent-primary, #38bdf8)'
            });
            
            cursorFollower.css({
                transform: 'scale(1)',
                borderColor: 'var(--accent-primary, #38bdf8)'
            });
        });
        
        // Verification timeout - disable if not working after 10 seconds
        setTimeout(() => {
            if (isInitialized && !isWorking) {
                console.warn('⚠️ Custom cursor not responding - disabling');
                disableCustomCursor();
            }
        }, 10000);
        
        console.log('🖱️ Custom cursor initialization complete');
        
    } catch (error) {
        console.error('❌ Custom cursor initialization failed:', error);
        disableCustomCursor();
    }
    
    // Function to disable custom cursor and restore defaults
    function disableCustomCursor() {
        try {
            // Remove event listeners
            $(document).off('.customCursor');
            
            // Remove cursor elements
            if (cursor && cursor.length) {
                cursor.remove();
            }
            if (cursorFollower && cursorFollower.length) {
                cursorFollower.remove();
            }
            
            // Remove body classes
            $('body').removeClass('custom-cursor-initialized custom-cursor-working');
            
            // Reset variables
            isInitialized = false;
            isWorking = false;
            cursor = null;
            cursorFollower = null;
            
            console.log('🖱️ Custom cursor disabled - default cursor restored');
            
        } catch (error) {
            console.error('❌ Error disabling custom cursor:', error);
        }
    }
    
    // Handle window resize
    $(window).on('resize.customCursor', function() {
        if (window.innerWidth <= 768 && isInitialized) {
            console.log('🖱️ Switched to mobile - disabling custom cursor');
            disableCustomCursor();
        } else if (window.innerWidth > 768 && !isInitialized) {
            console.log('🖱️ Switched to desktop - reinitializing custom cursor');
            setTimeout(initCursorEffects, 100);
        }
    });
    
    // Expose disable function globally for debugging
    window.disableCustomCursor = disableCustomCursor;
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