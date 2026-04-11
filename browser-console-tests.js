// Browser Console Smoke Tests for thromel.github.io
// Run in DevTools console on any page: testSite.runAll()

const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function resetResults() {
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.warnings = 0;
  testResults.tests.length = 0;
}

function record(name, passed, message) {
  testResults.tests.push({ name, passed, message: message || '' });
  if (passed) {
    testResults.passed += 1;
    console.log('PASS:', name, message || '');
  } else {
    testResults.failed += 1;
    console.error('FAIL:', name, message || '');
  }
}

function warn(name, message) {
  testResults.warnings += 1;
  console.warn('WARN:', name, message || '');
}

function hasValidProofState(value) {
  return ['loading', 'success', 'empty', 'error'].includes(value);
}

function testThemeToggle() {
  const buttons = document.querySelectorAll('#themeToggle');
  const button = buttons[0];
  const dataTheme = document.documentElement.getAttribute('data-theme');

  record('Exactly one theme toggle exists', buttons.length === 1, 'Found ' + buttons.length + ' #themeToggle nodes');
  record('Canonical data-theme exists', dataTheme === 'dark' || dataTheme === 'light', 'Current theme: ' + dataTheme);

  const hasSiteUX = typeof window.siteUX !== 'undefined' && typeof window.siteUX.toggleTheme === 'function';
  record('siteUX object exists', hasSiteUX, hasSiteUX ? '' : 'site-shell.js did not initialize');

  if (button) {
    record('Theme toggle has accessible label', !!button.getAttribute('aria-label'));
  }
}

function testSkipLinks() {
  const links = Array.from(document.querySelectorAll('.skip-link'));
  const hasMain = links.some((l) => l.getAttribute('href') === '#main-content');
  const hasNav = links.some((l) => l.getAttribute('href') === '#site-navigation');

  record('Skip link to main', hasMain);
  record('Skip link to navigation', hasNav);
}

function testNavigation() {
  const nav = document.getElementById('site-navigation');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileOverlay = document.getElementById('mobileNavOverlay');

  record('Main navigation exists', !!nav, nav ? '' : 'Missing #site-navigation');
  record('Mobile menu toggle exists', !!mobileToggle, mobileToggle ? '' : 'Missing #mobileMenuToggle');
  record('Mobile nav drawer exists', !!mobileDrawer, mobileDrawer ? '' : 'Missing #mobileNavDrawer');
  record('Mobile nav overlay exists', !!mobileOverlay, mobileOverlay ? '' : 'Missing #mobileNavOverlay');
}

function testCoreStylesLoaded() {
  const loaded = Array.from(document.styleSheets)
    .map((sheet) => (sheet.href ? sheet.href.split('/').pop() : 'inline'));

  ['overhaul.css', 'mobile-optimizations.css'].forEach((file) => {
    record('Stylesheet loaded: ' + file, loaded.some((x) => x.includes(file)));
  });
}

function testShellBehavior() {
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  record('Scroll progress exists', !!progress, progress ? '' : 'Missing #scrollProgress');
  record('Back-to-top button exists', !!backToTop, backToTop ? '' : 'Missing #backToTop');
}

function testHomeEnhancements() {
  const hasSectionNav = !!document.querySelector('.home-section-nav');

  if (!hasSectionNav) {
    warn('Home section nav', 'Not present on this page (expected for non-home pages).');
  } else {
    record('Home section nav exists', true);
  }
}

function testProofSurfaces() {
  const homeProof = document.getElementById('oss-summary');
  const contributionsProof = document.getElementById('contributions-proof');

  if (!homeProof) {
    warn('Homepage proof surface', 'Not present on this page (expected for non-home pages).');
  } else {
    const homeStatus = document.getElementById('oss-summary-status');
    const homeText = document.getElementById('oss-summary-text');
    const homeLinks = homeProof.querySelectorAll('.proof-links a');
    const homeState = homeProof.getAttribute('data-state');
    const statusState = homeStatus ? homeStatus.getAttribute('data-state') : '';

    record('Homepage proof surface exists', true);
    record('Homepage proof status exists', !!homeStatus, homeStatus ? '' : 'Missing #oss-summary-status');
    record('Homepage proof state is valid', hasValidProofState(homeState), 'Current state: ' + homeState);
    record('Homepage proof status state is valid', hasValidProofState(statusState), 'Current state: ' + statusState);
    record('Homepage proof copy exists', !!homeText && homeText.textContent.trim().length > 0);
    record('Homepage proof links exist', homeLinks.length > 0, 'Found ' + homeLinks.length + ' proof links');
  }

  if (!contributionsProof) {
    warn('Contributions proof surface', 'Not present on this page (expected for non-contributions pages).');
  } else {
    const contributionState = contributionsProof.getAttribute('data-state');
    const errorMessage = document.getElementById('error-state-message');

    record('Contributions proof surface exists', true);
    record('Contributions proof state is valid', hasValidProofState(contributionState), 'Current state: ' + contributionState);
    record('Contributions loading state exists', !!document.getElementById('loading-state'));
    record('Contributions error state exists', !!document.getElementById('error-state'));
    record('Contributions empty state exists', !!document.getElementById('empty-state'));
    record('Contributions success section exists', !!document.getElementById('contributions-section'));
    record('Contributions error message exists', !!errorMessage && errorMessage.textContent.trim().length > 0);
  }
}

function testPerformanceEntry() {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!navigation) {
    warn('Navigation timing', 'Performance API entry not available.');
    return;
  }

  const domReady = navigation.domContentLoadedEventEnd - navigation.fetchStart;
  const loadComplete = navigation.loadEventEnd - navigation.fetchStart;

  record('DOM ready under 3000ms', domReady < 3000, 'DOM ready: ' + Math.round(domReady) + 'ms');
  record('Load complete under 5000ms', loadComplete < 5000, 'Load: ' + Math.round(loadComplete) + 'ms');
}

function runAll() {
  resetResults();
  console.clear();
  console.log('Running smoke tests...');

  testThemeToggle();
  testSkipLinks();
  testNavigation();
  testShellBehavior();
  testCoreStylesLoaded();
  testHomeEnhancements();
  testProofSurfaces();
  testPerformanceEntry();

  console.log('----- Summary -----');
  console.log('Passed:', testResults.passed);
  console.log('Failed:', testResults.failed);
  console.log('Warnings:', testResults.warnings);

  if (testResults.failed === 0) {
    console.log('All required smoke tests passed.');
  }

  return testResults;
}

window.testSite = {
  runAll,
  results: testResults
};

console.log('Ready. Run testSite.runAll()');
