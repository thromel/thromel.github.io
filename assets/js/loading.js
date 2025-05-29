// Loading Animation Controller
(function () {
  'use strict';

  // Create loading overlay HTML
  const loadingHTML = `
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading</div>
                <div class="loading-subtext">Please wait while we prepare your content</div>
                <div class="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
    `;

  // Insert loading overlay into page
  function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.innerHTML = loadingHTML;
    document.body.insertBefore(
      overlay.firstElementChild,
      document.body.firstChild
    );
  }

  // Remove loading overlay with smooth fade out
  function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('fade-out');

      // Remove from DOM after animation completes
      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 500);
    }
  }

  // Show loading overlay immediately
  function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('fade-out');
    } else {
      createLoadingOverlay();
    }
  }

  // Initialize loading animation
  function initLoading() {
    // Show loading immediately when script runs
    createLoadingOverlay();

    // Hide loading when page is fully loaded
    if (document.readyState === 'complete') {
      // Page is already loaded
      setTimeout(hideLoadingOverlay, 300);
    } else {
      // Wait for page to load
      window.addEventListener('load', function () {
        // Add minimum loading time for smooth experience
        setTimeout(hideLoadingOverlay, 500);
      });

      // Fallback: hide loading after maximum time
      setTimeout(hideLoadingOverlay, 8000);
    }
  }

  // Handle navigation loading for single-page applications
  function handleNavigationLoading() {
    // Show loading on navigation start
    const showLoadingForNavigation = () => {
      showLoadingOverlay();

      // Hide after content loads
      setTimeout(() => {
        hideLoadingOverlay();
      }, 800);
    };

    // Listen for navigation events (for SPAs)
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      window.history.pushState = function () {
        showLoadingForNavigation();
        return originalPushState.apply(window.history, arguments);
      };

      const originalReplaceState = window.history.replaceState;
      window.history.replaceState = function () {
        showLoadingForNavigation();
        return originalReplaceState.apply(window.history, arguments);
      };

      window.addEventListener('popstate', showLoadingForNavigation);
    }

    // Listen for link clicks that would cause navigation
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (
        link &&
        link.href &&
        !link.href.startsWith('#') &&
        !link.href.startsWith('javascript:') &&
        !link.href.startsWith('mailto:') &&
        !link.href.startsWith('tel:') &&
        !link.target &&
        link.hostname === window.location.hostname
      ) {
        showLoadingForNavigation();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initLoading();
      handleNavigationLoading();
    });
  } else {
    initLoading();
    handleNavigationLoading();
  }

  // Expose functions globally for manual control
  window.LoadingAnimation = {
    show: showLoadingOverlay,
    hide: hideLoadingOverlay,
  };
})();
