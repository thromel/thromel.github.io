// aHR0cHM6Ly9naXRodWIuY29tL2x1b3N0MjYvYWNhZGVtaWMtaG9tZXBhZ2U=
$(function () {
  lazyLoadOptions = {
    scrollDirection: 'vertical',
    effect: 'fadeIn',
    effectTime: 200,
    placeholder: '',
    onError: function (element) {
      console.log('[lazyload] Error loading ' + element.data('src'));
    },
    beforeLoad: function (element) {
      element.addClass('loading');
    },
    afterLoad: function (element) {
      element.removeClass('loading').addClass('loaded');
      if (element.is('img')) {
        element.css('background-image', 'none');
      } else if (element.is('div')) {
        element.css({
          'background-size': 'cover',
          'background-position': 'center'
        });
      }
      // Trigger layout recalculation only once
      $grid.masonry('layout');
    },
  };

  $('img.lazy, div.lazy:not(.always-load)').Lazy({
    visibleOnly: true,
    ...lazyLoadOptions,
  });
  $('div.lazy.always-load').Lazy({ visibleOnly: false, ...lazyLoadOptions });

  $('[data-toggle="tooltip"]').tooltip();

  var $grid = $('.grid');
  if ($grid.length) {
    $grid.masonry({
      percentPosition: true,
      itemSelector: '.grid-item',
      columnWidth: '.grid-sizer',
      transitionDuration: '0.2s'
    });
    
    // Debounced layout function to prevent excessive calls
    var layoutTimer;
    function debouncedLayout() {
      clearTimeout(layoutTimer);
      layoutTimer = setTimeout(function() {
        $grid.masonry('layout');
      }, 50);
    }
    
    // Layout after images load
    $grid.imagesLoaded().progress(debouncedLayout);
    
    // Layout for lazy loaded images
    $('.lazy').on('load', debouncedLayout);
  }

  // Handle collapsible sections with animation optimization
  $('.collapse').on('show.bs.collapse', function () {
    var $btn = $(this).prev('.collapsible-btn');
    $btn.attr('aria-expanded', 'true').addClass('expanded');
    // Recalculate grid layout after expansion
    if ($grid.length) {
      setTimeout(function() {
        $grid.masonry('layout');
      }, 300);
    }
  });

  $('.collapse').on('hide.bs.collapse', function () {
    var $btn = $(this).prev('.collapsible-btn');
    $btn.attr('aria-expanded', 'false').removeClass('expanded');
    // Recalculate grid layout after collapse
    if ($grid.length) {
      setTimeout(function() {
        $grid.masonry('layout');
      }, 300);
    }
  });
  
  // Optimize animations on page load
  $(window).on('load', function() {
    // Remove will-change after initial load to improve performance
    setTimeout(function() {
      $('body').css('will-change', 'auto');
    }, 500);
  });
  
  // Handle theme transitions smoothly
  $(document).on('click', '.theme-toggle', function() {
    $('body').addClass('theme-transition');
    setTimeout(function() {
      $('body').removeClass('theme-transition');
    }, 400);
  });

  // Smooth Scrolling Navigation Enhancement
  initSmoothScrolling();
});

// Smooth Scrolling Navigation Functions
function initSmoothScrolling() {
  // Initialize scroll indicator
  $('body').prepend('<div class="scroll-indicator"><div class="scroll-indicator-progress"></div></div>');
  
  // Initialize back to top button
  $('body').append('<button class="back-to-top" title="Back to top" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>');
  
  // Smooth scrolling for navigation links
  $('a[href^="#"]').on('click', function(e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      const offsetTop = target.offset().top - 80; // Account for fixed navbar
      $('html, body').animate({
        scrollTop: offsetTop
      }, 800, 'easeInOutCubic');
    }
  });
  
  // Scroll indicator and back to top button
  $(window).on('scroll', throttle(function() {
    const scrollTop = $(window).scrollTop();
    const docHeight = $(document).height();
    const winHeight = $(window).height();
    const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
    
    // Update scroll indicator
    $('.scroll-indicator-progress').css('width', Math.max(0, Math.min(100, scrollPercent)) + '%');
    
    // Show/hide back to top button
    if (scrollTop > 300) {
      $('.back-to-top').addClass('visible');
    } else {
      $('.back-to-top').removeClass('visible');
    }
    
    // Update active navigation links
    updateActiveNavigation();
  }, 16));
  
  // Back to top button functionality
  $('.back-to-top').on('click', function() {
    $('html, body').animate({
      scrollTop: 0
    }, 800, 'easeInOutCubic');
  });
  
  // Initialize section visibility observers
  initSectionObserver();
}

// Update active navigation based on scroll position
function updateActiveNavigation() {
  const scrollTop = $(window).scrollTop();
  const sections = ['education', 'experience', 'research', 'projects', 'skills'];
  
  sections.forEach(function(section) {
    const element = $('#' + section);
    if (element.length) {
      const offsetTop = element.offset().top - 100;
      const offsetBottom = offsetTop + element.outerHeight();
      
      if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
        $('.nav-link').removeClass('section-active');
        $(`.nav-link[href="#${section}"]`).addClass('section-active');
      }
    }
  });
}

// Initialize intersection observer for section animations
function initSectionObserver() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          $(entry.target).addClass('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all content sections
    $('.content-section, .card, .position-card, .research-card').each(function() {
      observer.observe(this);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    $('.content-section, .card, .position-card, .research-card').addClass('visible');
  }
}

// Throttle function for scroll events
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

// Custom easing function for smooth animations
$.easing.easeInOutCubic = function(x, t, b, c, d) {
  if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
  return c / 2 * ((t -= 2) * t * t + 2) + b;
};
