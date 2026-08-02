(function () {
  'use strict';

  var THEME_KEY = 'theme';
  var THEME_COLORS = { light: '#f5f1e8', dark: '#0c1513' };
  var root = document.documentElement;

  function storedTheme() {
    try {
      var value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_) {
      return null;
    }
  }

  function preferredTheme() {
    var stored = storedTheme();
    if (stored) return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    var themeColor = document.getElementById('theme-color');
    if (themeColor) themeColor.setAttribute('content', THEME_COLORS[theme]);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    }
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      var dark = theme === 'dark';
      var label = dark ? 'Use light theme' : 'Use dark theme';
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', label);
    }
  }

  function initTheme() {
    var toggle = document.getElementById('theme-toggle');
    setTheme(root.getAttribute('data-theme') || preferredTheme(), false);
    if (toggle) {
      toggle.disabled = false;
      toggle.removeAttribute('aria-disabled');
      toggle.addEventListener('click', function () {
        setTheme((root.getAttribute('data-theme') || 'light') === 'dark' ? 'light' : 'dark', true);
      });
    }
  }

  function initMenu() {
    var menu = document.getElementById('site-menu-toggle');
    var navigation = document.getElementById('site-navigation');
    if (!menu || !navigation) return;

    function setOpen(open) {
      navigation.setAttribute('data-menu-open', String(open));
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      menu.textContent = open ? 'Close' : 'Menu';
    }

    menu.disabled = false;
    menu.removeAttribute('aria-disabled');
    setOpen(false);
    menu.addEventListener('click', function () { setOpen(menu.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        menu.focus();
      }
    });
    navigation.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    if (window.matchMedia) {
      var desktop = window.matchMedia('(min-width: 720px)');
      var closeForDesktop = function (event) {
        if (event.matches) setOpen(false);
      };
      if (desktop.addEventListener) desktop.addEventListener('change', closeForDesktop);
      else if (desktop.addListener) desktop.addListener(closeForDesktop);
    }
  }

  function initSkipLinks() {
    document.querySelectorAll('.skip-link[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
        history.replaceState(null, '', link.getAttribute('href'));
      });
    });
  }

  function markShellReady() {
    if (window.__portfolioShellFallback) {
      window.clearTimeout(window.__portfolioShellFallback);
      window.__portfolioShellFallback = 0;
    }
    root.classList.remove('shell-failed');
    root.classList.add('js-enabled', 'shell-ready');
  }

  function initInteractionMetrics() {
    var metrics = {
      supported: false,
      interactions: 0,
      inp: null,
      source: 'PerformanceEventTiming'
    };
    window.siteVitals = metrics;

    if (!window.PerformanceObserver ||
        !PerformanceObserver.supportedEntryTypes ||
        PerformanceObserver.supportedEntryTypes.indexOf('event') === -1) return;

    var interactionDurations = new Map();
    var observer;

    function updateCandidate() {
      var values = Array.from(interactionDurations.values()).sort(function (a, b) { return b - a; });
      if (!values.length) return;
      // INP discards one worst interaction for every 50 interactions. For a
      // short lab visit, this is therefore the slowest observed interaction.
      var index = Math.min(Math.floor(values.length / 50), values.length - 1);
      metrics.interactions = values.length;
      metrics.inp = Math.round(values[index]);
    }

    try {
      observer = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (!entry.interactionId) return;
          var previous = interactionDurations.get(entry.interactionId) || 0;
          interactionDurations.set(entry.interactionId, Math.max(previous, entry.duration));
        });
        updateCandidate();
      });
      observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
      metrics.supported = true;
      metrics.disconnect = function () { observer.disconnect(); };
    } catch (_) {}
  }

  function init() {
    markShellReady();
    initTheme();
    initMenu();
    initSkipLinks();
    initInteractionMetrics();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.siteShell = { setTheme: setTheme };
}());
