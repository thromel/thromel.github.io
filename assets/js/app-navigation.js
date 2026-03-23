// App-like Navigation Transitions
// Phase 3: Progressive Web App Features & Advanced Micro-interactions

$(document).ready(function() {
    initAppNavigation();
});

function initAppNavigation() {
    initMobileGestures();
    initStackNavigation();
    initTabBarEffects();
    initBackButton();
    initRouteTransitions();
    initNavigationHistory();
    
    console.log('📱 App-like navigation initialized');
}

// Mobile gesture navigation (swipe gestures)
function initMobileGestures() {
    if ('ontouchstart' in window) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        
        const threshold = 50; // Minimum swipe distance
        const navbar = $('.navbar');
        const pages = ['/', '/projects', '/research', '/experience', '/cv'];
        const currentPath = window.location.pathname;
        const currentIndex = pages.indexOf(currentPath) || 0;
        
        // Touch start
        $(document).on('touchstart', function(e) {
            const touch = e.originalEvent.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isDragging = false;
        });
        
        // Touch move
        $(document).on('touchmove', function(e) {
            if (!isDragging) {
                const touch = e.originalEvent.touches[0];
                currentX = touch.clientX;
                currentY = touch.clientY;
                
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;
                
                // Only start dragging if horizontal movement is dominant
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                    isDragging = true;
                    $('body').addClass('gesture-navigation');
                    
                    // Create navigation preview
                    showNavigationPreview(deltaX > 0 ? 'right' : 'left');
                }
                
                if (isDragging) {
                    e.preventDefault();
                    const progress = Math.min(Math.abs(deltaX) / 200, 1);
                    updateNavigationPreview(deltaX, progress);
                }
            }
        });
        
        // Touch end
        $(document).on('touchend', function(e) {
            if (isDragging) {
                const deltaX = currentX - startX;
                const isSwipeRight = deltaX > threshold;
                const isSwipeLeft = deltaX < -threshold;
                
                if (isSwipeRight && currentIndex > 0) {
                    // Navigate to previous page
                    navigateToPage(pages[currentIndex - 1], 'slide-right');
                } else if (isSwipeLeft && currentIndex < pages.length - 1) {
                    // Navigate to next page
                    navigateToPage(pages[currentIndex + 1], 'slide-left');
                } else {
                    // Cancel navigation
                    cancelNavigationPreview();
                }
                
                $('body').removeClass('gesture-navigation');
                hideNavigationPreview();
                isDragging = false;
            }
        });
    }
}

// Stack-based navigation system
function initStackNavigation() {
    window.navigationStack = window.navigationStack || [];
    
    // Override link navigation for internal links
    $(document).on('click', 'a[href^="/"]', function(e) {
        const href = $(this).attr('href');
        const currentPath = window.location.pathname;
        
        if (href !== currentPath && !$(this).hasClass('no-transition')) {
            e.preventDefault();
            
            // Determine transition direction
            const isBack = window.navigationStack.includes(href);
            const transition = isBack ? 'slide-right' : 'slide-left';
            
            navigateToPage(href, transition);
        }
    });
}

// Enhanced tab bar effects
function initTabBarEffects() {
    const navbar = $('.navbar');
    let lastScrollTop = 0;
    
    // Auto-hide navbar on scroll (mobile)
    if (window.innerWidth <= 768) {
        $(window).on('scroll', throttle(function() {
            const scrollTop = $(this).scrollTop();
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.addClass('navbar-hidden');
            } else {
                // Scrolling up
                navbar.removeClass('navbar-hidden');
            }
            
            lastScrollTop = scrollTop;
        }, 100));
    }
    
    // Add navbar hidden styles
    if (!$('#navbar-styles').length) {
        $('<style id="navbar-styles">').text(`
            .navbar {
                transition: transform 0.3s ease;
            }
            .navbar-hidden {
                transform: translateY(-100%);
            }
            .gesture-navigation .navbar {
                z-index: 10001;
            }
        `).appendTo('head');
    }
}

// Native-like back button functionality
function initBackButton() {
    // Disable back button creation to prevent navbar overlap
    return;
    // Create back button for mobile
    if (window.innerWidth <= 768) {
        const backButton = $(`
            <button class="app-back-button" style="
                position: fixed;
                top: 60px;
                left: 15px;
                width: 40px;
                height: 40px;
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1001;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            ">
                <i class="fas fa-arrow-left" style="color: var(--text-primary);"></i>
            </button>
        `);
        
        $('body').append(backButton);
        
        // Show/hide back button based on navigation stack
        function updateBackButton() {
            if (window.navigationStack && window.navigationStack.length > 0) {
                backButton.show().css('display', 'flex');
            } else {
                backButton.hide();
            }
        }
        
        backButton.on('click', function() {
            if (window.navigationStack && window.navigationStack.length > 0) {
                const previousPage = window.navigationStack.pop();
                navigateToPage(previousPage, 'slide-right');
            }
        });
        
        // Update back button visibility
        $(window).on('navigation-changed', updateBackButton);
    }
}

// Route transitions with animation
function initRouteTransitions() {
    // Create transition overlay
    const transitionOverlay = $(`
        <div class="route-transition-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            pointer-events: none;
        "></div>
    `);
    
    $('body').append(transitionOverlay);
    
    window.transitionOverlay = transitionOverlay;
}

// Navigation history management
function initNavigationHistory() {
    // Initialize navigation stack
    window.navigationStack = JSON.parse(sessionStorage.getItem('navigationStack') || '[]');
    
    // Save current page to stack when navigating away
    $(window).on('beforeunload', function() {
        const currentPath = window.location.pathname;
        if (window.navigationStack.indexOf(currentPath) === -1) {
            sessionStorage.setItem('navigationStack', JSON.stringify(window.navigationStack));
        }
    });
    
    // Handle browser back/forward buttons
    $(window).on('popstate', function(e) {
        if (e.originalEvent.state) {
            const transition = e.originalEvent.state.transition || 'slide-right';
            showPageTransition(transition);
        }
    });
}

// Core navigation functions
function navigateToPage(url, transition = 'slide-left') {
    const currentPath = window.location.pathname;
    
    // Add current page to navigation stack
    if (window.navigationStack.indexOf(currentPath) === -1) {
        window.navigationStack.push(currentPath);
    }
    
    // Show transition animation
    showPageTransition(transition);
    
    // Navigate after animation starts
    setTimeout(() => {
        // Update browser history
        window.history.pushState({ transition: transition }, '', url);
        
        // Navigate to new page
        window.location.href = url;
    }, 150);
}

function showPageTransition(transition) {
    const overlay = window.transitionOverlay;
    
    // Set transition direction
    overlay.removeClass('slide-left slide-right fade');
    overlay.addClass(transition);
    
    // Show overlay
    overlay.css({
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto'
    });
    
    // Add transition styles
    if (!$('#transition-styles').length) {
        $('<style id="transition-styles">').text(`
            .route-transition-overlay.slide-left {
                transform: translateX(-100%);
                animation: slideInLeft 0.3s ease forwards;
            }
            .route-transition-overlay.slide-right {
                transform: translateX(100%);
                animation: slideInRight 0.3s ease forwards;
            }
            .route-transition-overlay.fade {
                animation: fadeIn 0.3s ease forwards;
            }
            
            @keyframes slideInLeft {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `).appendTo('head');
    }
}

// Navigation preview functions (for gestures)
function showNavigationPreview(direction) {
    const preview = $(`
        <div class="navigation-preview ${direction}" style="
            position: fixed;
            top: 0;
            ${direction === 'left' ? 'left: -100%' : 'right: -100%'};
            width: 100%;
            height: 100%;
            background: var(--bg-secondary);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: var(--text-primary);
            transition: ${direction === 'left' ? 'left' : 'right'} 0.1s ease;
        ">
            <div class="preview-content">
                <i class="fas fa-arrow-${direction === 'left' ? 'left' : 'right'} fa-2x mb-2"></i>
                <div>Swipe to navigate</div>
            </div>
        </div>
    `);
    
    $('body').append(preview);
    window.navigationPreview = preview;
}

function updateNavigationPreview(deltaX, progress) {
    const preview = window.navigationPreview;
    if (!preview) return;
    
    const direction = deltaX > 0 ? 'left' : 'right';
    const position = Math.min(progress * 100, 100);
    
    if (direction === 'left') {
        preview.css('left', `-${100 - position}%`);
    } else {
        preview.css('right', `-${100 - position}%`);
    }
    
    // Update opacity based on progress
    preview.css('opacity', progress);
}

function hideNavigationPreview() {
    if (window.navigationPreview) {
        window.navigationPreview.remove();
        window.navigationPreview = null;
    }
}

function cancelNavigationPreview() {
    const preview = window.navigationPreview;
    if (!preview) return;
    
    preview.css({
        left: preview.hasClass('left') ? '-100%' : 'auto',
        right: preview.hasClass('right') ? '-100%' : 'auto',
        opacity: 0
    });
    
    setTimeout(() => {
        hideNavigationPreview();
    }, 200);
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

// iOS-style haptic feedback (if supported)
function triggerHapticFeedback(type = 'light') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [30, 10, 30, 10, 30]
        };
        
        navigator.vibrate(patterns[type] || patterns.light);
    }
}

// Add haptic feedback to button interactions
$(document).on('touchstart click', '.btn, .nav-link, .card-interactive', function() {
    triggerHapticFeedback('light');
});

// Export for external use
window.AppNavigation = {
    navigateToPage,
    showPageTransition,
    triggerHapticFeedback,
    throttle
};