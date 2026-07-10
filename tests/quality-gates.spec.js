const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { test, expect, chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

function gzipSize(file) {
  return zlib.gzipSync(fs.readFileSync(path.join(ROOT, file))).length;
}

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

async function mockGitHubCount(page) {
  await page.route('https://api.github.com/search/issues*', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total_count: 47, incomplete_results: false, items: [] }) });
  });
}

test.describe('accessibility and release-quality gates', () => {
  test('core pages have no serious or critical axe violations at desktop and phone widths', async ({ page }) => {
    for (const width of [390, 1280]) {
      for (const route of ['/', '/research', '/publications', '/projects', '/contributions']) {
        await page.setViewportSize({ width, height: 900 });
        if (route === '/contributions') await mockGitHubCount(page);
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        const results = await new AxeBuilder({ page }).analyze();
        const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
        expect(blocking, `${route} at ${width}px: ${blocking.map((violation) => violation.id).join(', ')}`).toEqual([]);
      }
    }
  });

  test('first-party style, script, image, and homepage-transfer budgets stay bounded', async ({ page }) => {
    expect(gzipSize('assets/css/overhaul.css')).toBeLessThanOrEqual(25 * 1024);
    expect(gzipSize('assets/js/site-shell.js') + gzipSize('assets/js/contribution-count.js')).toBeLessThanOrEqual(20 * 1024);

    const rasterExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
    const oversized = filesUnder(path.join(ROOT, 'assets/images'))
      .filter((file) => rasterExtensions.has(path.extname(file).toLowerCase()))
      .filter((file) => fs.statSync(file).size > 500 * 1024)
      .map((file) => path.relative(ROOT, file));
    expect(oversized).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const transferBytes = await page.evaluate(() => {
      const ownOrigin = location.origin;
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource')
        .filter((entry) => new URL(entry.name).origin === ownOrigin)
        .reduce((total, entry) => total + (entry.transferSize || 0), 0);
      return resources + (navigation ? navigation.transferSize || 0 : 0);
    });
    expect(transferBytes).toBeLessThanOrEqual(1.5 * 1024 * 1024);
  });

  test('canonical configuration, UI checks, and daily Pages rebuild are committed release contracts', () => {
    const config = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
    const layout = fs.readFileSync(path.join(ROOT, '_layouts/default.html'), 'utf8');
    const packageManifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const verificationScript = fs.readFileSync(path.join(ROOT, 'scripts/verify-ui.sh'), 'utf8');
    const refreshWorkflow = fs.readFileSync(path.join(ROOT, '.github/workflows/refresh-pages.yml'), 'utf8');
    const uiWorkflow = fs.readFileSync(path.join(ROOT, '.github/workflows/ui-checks.yml'), 'utf8');

    expect(config).toContain('url: "https://tanzimhromel.com"');
    expect(layout).not.toContain('oss-summary.js');
    expect(layout).not.toContain('contributions.js');
    expect(refreshWorkflow).toMatch(/schedule:/);
    expect(refreshWorkflow).toMatch(/workflow_dispatch:/);
    expect(refreshWorkflow).toMatch(/pages:\s*write/);
    expect(refreshWorkflow).toMatch(/gh api --method POST/);
    expect(refreshWorkflow).toMatch(/\/pages\/builds/);
    expect(uiWorkflow).toMatch(/npm ci/);
    expect(uiWorkflow).toMatch(/npm run test:ui:install/);
    expect(uiWorkflow).toMatch(/npm run test:ui/);
    expect(packageManifest.engines.node).toBe('>=20 <23 || >=24');
    expect(verificationScript).toContain('NODE_MAJOR');
  });

  test('mobile Lighthouse keeps LCP at or below 2.5 seconds and CLS at or below 0.1', async () => {
    test.setTimeout(60000);
    const lighthouse = (await import('lighthouse')).default;
    const { launch } = await import('chrome-launcher');
    const chrome = await launch({
      chromePath: chromium.executablePath(),
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const report = await lighthouse(BASE_URL, {
        port: chrome.port,
        onlyCategories: ['performance'],
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 1, disabled: false },
        throttlingMethod: 'provided',
        logLevel: 'error',
      });
      expect(report.lhr.audits['largest-contentful-paint'].numericValue).toBeLessThanOrEqual(2500);
      expect(report.lhr.audits['cumulative-layout-shift'].numericValue).toBeLessThanOrEqual(0.1);
    } finally {
      await chrome.kill();
    }
  });
});
