(function () {
  const THEME_KEY = 'theme';
  const DEFAULT_THEME = 'dark';
  const root = document.documentElement;

  function readTheme() {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : DEFAULT_THEME;
    } catch (_) {
      return DEFAULT_THEME;
    }
  }

  function writeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      // Ignore write failures in private/restricted contexts.
    }
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    const button = document.getElementById('themeToggle');
    if (!icon || !button) {
      return;
    }

    const isDark = theme === 'dark';
    icon.classList.toggle('fa-sun', isDark);
    icon.classList.toggle('fa-moon', !isDark);
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    writeTheme(theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const currentTheme = root.getAttribute('data-theme') || DEFAULT_THEME;
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    applyTheme(readTheme());

    const themeButton = document.getElementById('themeToggle');
    if (!themeButton) {
      return;
    }

    themeButton.addEventListener('click', toggleTheme);
  }

  function initMobileNav() {
    const toggle = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileNavDrawer');
    const closeButton = document.getElementById('mobileNavClose');
    const overlay = document.getElementById('mobileNavOverlay');

    if (!toggle || !drawer || !overlay) {
      return;
    }

    const openNav = function () {
      drawer.classList.add('open');
      overlay.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeNav = function () {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (closeButton) {
      closeButton.addEventListener('click', closeNav);
    }

    overlay.addEventListener('click', closeNav);

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawer.classList.contains('open')) {
        closeNav();
      }
    });
  }

  function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) {
      return;
    }

    let ticking = false;

    const update = function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.max(0, Math.min(100, scrollPercent)) + '%';
      ticking = false;
    };

    const requestUpdate = function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    update();
  }

  function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateVisibility = function () {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  function initHomeSectionNav() {
    var sectionNav = document.querySelector('.home-section-nav');
    if (!sectionNav) {
      return;
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sectionLinks = sectionNav.querySelectorAll('a[href^="#"]');

    sectionLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var targetId = link.getAttribute('href');
        var target = targetId ? document.querySelector(targetId) : null;
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        window.history.replaceState(null, '', targetId);
      });
    });

    if (!('IntersectionObserver' in window)) {
      return;
    }

    var sections = Array.from(sectionLinks)
      .map(function (link) {
        var href = link.getAttribute('href');
        return href ? document.querySelector(href) : null;
      })
      .filter(Boolean);

    if (!sections.length) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var currentId = '#' + entry.target.id;
          sectionLinks.forEach(function (link) {
            var isActive = link.getAttribute('href') === currentId;
            link.classList.toggle('active', isActive);
            if (isActive) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function init() {
    initTheme();
    initMobileNav();
    initScrollProgress();
    initBackToTop();
    initHomeSectionNav();
  }

  root.setAttribute('data-theme', readTheme());
  document.addEventListener('DOMContentLoaded', init);

  window.siteUX = {
    init: init,
    setTheme: applyTheme,
    toggleTheme: toggleTheme,
    initNavigation: initMobileNav,
    initHomePageEnhancements: initHomeSectionNav
  };
})();
