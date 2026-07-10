(function () {
  'use strict';

  var THEME_KEY = 'theme';
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
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    }
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      var dark = theme === 'dark';
      toggle.textContent = dark ? 'Light' : 'Dark';
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function initTheme() {
    var toggle = document.getElementById('theme-toggle');
    setTheme(root.getAttribute('data-theme') || preferredTheme(), false);
    if (toggle) {
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

    setOpen(false);
    menu.addEventListener('click', function () { setOpen(menu.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
    navigation.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
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

  function init() {
    root.classList.add('js-enabled');
    initTheme();
    initMenu();
    initSkipLinks();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.siteShell = { setTheme: setTheme };
}());
