(function () {
  var THEME_KEY = 'theme';

  function getStoredTheme() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch (_) {
      return null;
    }
  }

  function getPreferredTheme() {
    if (getStoredTheme()) {
      return getStoredTheme();
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function setTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    }
    updateThemeToggle(theme);
  }

  function updateThemeToggle(theme) {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) {
      return;
    }
    var isDark = theme === 'dark';
    var label = toggle.querySelector('.theme-toggle__label');
    if (label) {
      label.textContent = isDark ? 'Light' : 'Dark';
    } else {
      toggle.textContent = isDark ? 'Light' : 'Dark';
    }
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function initThemeToggle() {
    var toggle = document.getElementById('themeToggle');
    var initial = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    setTheme(initial, false);
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(current === 'dark' ? 'light' : 'dark', true);
    });
  }

  function initAcademicSectionNav() {
    var linkRows = document.querySelectorAll('.academic-link-row');
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    linkRows.forEach(function (row) {
      row.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
          var target = document.querySelector(link.getAttribute('href'));
          if (!target) {
            return;
          }
          event.preventDefault();
          target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
          window.history.replaceState(null, '', link.getAttribute('href'));
        });
      });
    });
  }

  function initHeaderScrollState() {
    var header = document.querySelector('.academic-header');
    var ticking = false;

    if (!header) {
      return;
    }

    function syncHeaderState() {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
      ticking = false;
    }

    syncHeaderState();
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(syncHeaderState);
        ticking = true;
      }
    }, { passive: true });
  }

  function init() {
    initThemeToggle();
    initAcademicSectionNav();
    initHeaderScrollState();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.siteUX = { init: init, setTheme: setTheme, initHomePageEnhancements: initAcademicSectionNav };
})();
