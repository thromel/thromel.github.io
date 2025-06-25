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
});
