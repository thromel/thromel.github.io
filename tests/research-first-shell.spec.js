const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const HOME_SECTIONS = [
  'identity', 'about', 'research', 'publications', 'experience',
  'engineering', 'education', 'recognition', 'milestones', 'contact',
];
const CORE_ROUTES = ['Research', 'Publications', 'Projects', 'CV'];
const OTHER_ROUTES = ['Contributions', 'About', 'Education', 'Work', 'Achievements', 'News', 'Learning'];

async function visitHome(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
}

async function expectNoHorizontalOverflow(page, width) {
  await page.setViewportSize({ width, height: 900 });
  await visitHome(page);
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${width}px viewport`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test.describe('research-first shell contract', () => {
  test('home presents the complete professional dossier in a deliberate order', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const sections = page.locator('main > [data-home-section]');
    await expect(sections).toHaveCount(HOME_SECTIONS.length);
    await expect(sections.evaluateAll((elements) => elements.map((element) => element.dataset.homeSection))).resolves.toEqual(HOME_SECTIONS);
    await expect(page.locator('[data-home-section="identity"] h1')).toContainText('Tanzim Hossain Romel');
    await expect(page.locator('[data-home-research-lane]')).toHaveCount(6);
    await expect(page.locator('[data-home-publication]')).toHaveCount(2);
    await expect(page.locator('[data-home-experience]')).toHaveCount(3);
    await expect(page.locator('[data-home-metric]')).toHaveCount(4);
    await expect(page.locator('[data-home-engineering]')).toHaveCount(7);
    await expect(page.locator('[data-home-education]')).toHaveCount(3);
    await expect(page.locator('[data-home-recognition]')).toHaveCount(6);
    await expect(page.locator('[data-home-milestone]')).toHaveCount(4);
    await expect(page.locator('[data-home-section="about"]')).toContainText('Rajshahi');
    await expect(page.locator('[data-home-section="contact"]')).toContainText('Collaborate');
    await expect(page.locator('main')).not.toContainText('Sentiment Analysis of Anonymous Crisis Reports');
    await expect(page.locator('main')).not.toContainText('Blockchain');

    const affiliationLogos = page.locator('[data-home-affiliation-logo]');
    await expect(affiliationLogos).toHaveCount(3);
    await expect(page.locator('[data-home-affiliation="UIUC"] img')).toHaveAttribute('alt', /UIUC/i);
    await expect(page.locator('[data-home-affiliation="University of Alberta"] img')).toHaveAttribute('alt', /University of Alberta/i);
    await expect(page.locator('[data-home-affiliation="BUET"] img')).toHaveAttribute('alt', /BUET/i);
    expect(await affiliationLogos.evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);

    const portrait = page.locator('[data-home-portrait]');
    await expect(portrait).toHaveCount(1);
    await expect(portrait).toHaveAttribute('alt', /Tanzim Hossain Romel/i);
    await expect(portrait).toHaveAttribute('fetchpriority', 'high');
    expect(await portrait.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);

  });

  test('hero name stays on one compact line from desktop through narrow mobile', async ({ page }) => {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await visitHome(page);
      const typography = await page.locator('[data-home-section="identity"] h1').evaluate((heading) => {
        const style = getComputedStyle(heading);
        return {
          fontSize: parseFloat(style.fontSize),
          lineHeight: parseFloat(style.lineHeight),
          height: heading.getBoundingClientRect().height,
          whiteSpace: style.whiteSpace,
        };
      });
      expect(typography.fontSize, `${width}px hero name`).toBeLessThanOrEqual(48);
      expect(typography.height, `${width}px hero name line count`).toBeLessThanOrEqual(typography.lineHeight * 1.15);
      expect(typography.whiteSpace, `${width}px hero name wrapping`).toBe('nowrap');
    }
  });

  test('homepage uses the approved natural-language summaries', async ({ page }) => {
    await visitHome(page);
    const main = page.locator('main');
    await expect(main).toContainText('I study AI agents in real software systems.');
    await expect(main).toContainText('three years of software and AI engineering experience');
    await expect(main).toContainText('backend services, cloud data workflows, and LLM/RAG features for healthcare analytics');
    await expect(main).toContainText('I learn by building');
    await expect(main).toContainText('Recent changes to my research and academic plans.');
    await expect(main).not.toContainText('A builder who wants claims to leave receipts');
    await expect(main).not.toContainText('A compact currentness ledger');
  });

  test('homepage media is meaningful, lazy below the fold, and decodes successfully', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visitHome(page);

    const portrait = page.locator('[data-home-portrait]');
    await expect(portrait).toHaveAttribute('fetchpriority', 'high');
    await expect(portrait).toHaveAttribute('alt', /seated outdoors/i);
    expect(await portrait.evaluate((image) => [image.naturalWidth, image.naturalHeight])).toEqual([960, 1280]);
    const images = page.locator('[data-home-image]');
    expect(await images.count()).toBeGreaterThanOrEqual(10);
    for (const image of await images.all()) {
      await expect(image).toHaveAttribute('alt', /\S+/);
      await expect(image).toHaveAttribute('loading', 'lazy');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
    }
  });

  test('desktop navigation keeps the research core visible and exposes every other page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const nav = page.locator('#site-navigation');
    const labels = await nav.locator(':scope > a').allTextContents();
    expect(labels.map((label) => label.replace(/\s+/g, ' ').trim())).toEqual([
      ...CORE_ROUTES,
    ]);
    for (const label of labels) {
      await expect(nav.getByRole('link', { name: label.trim(), exact: true })).toBeVisible();
    }

    const more = nav.locator('[data-more-navigation]');
    await expect(more).toHaveCount(1);
    const moreSummary = more.locator('summary');
    await expect(moreSummary).toHaveText('More');
    await moreSummary.click();
    for (const route of OTHER_ROUTES) {
      await expect(more.getByRole('link', { name: route, exact: true })).toBeVisible();
    }
  });

  test('mobile menu has an accessible 44px control and exposes the complete page directory', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await visitHome(page);

    const menuToggle = page.getByRole('button', { name: /menu/i });
    await expect(menuToggle).toHaveAttribute('id', 'site-menu-toggle');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    const bounds = await menuToggle.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    for (const route of CORE_ROUTES) {
      await expect(page.locator('#site-navigation').getByRole('link', { name: route, exact: true })).toBeVisible();
    }
    const more = page.locator('#site-navigation [data-more-navigation]');
    const moreSummary = more.locator('summary');
    await expect(moreSummary).toBeVisible();
    await moreSummary.click();
    for (const route of OTHER_ROUTES) {
      await expect(more.getByRole('link', { name: route, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('theme follows the first-paint system preference until storage overrides it', async ({ browser }) => {
    for (const systemTheme of ['light', 'dark']) {
      const context = await browser.newContext({ colorScheme: systemTheme });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__themeAssignments = [];
        const originalSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function (name, value) {
          if (name === 'data-theme' && this === document.documentElement) {
            window.__themeAssignments.push(value);
          }
          return originalSetAttribute.call(this, name, value);
        };
      });
      await visitHome(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', systemTheme);
      await expect.poll(() => page.evaluate(() => window.__themeAssignments[0])).toBe(systemTheme);
      await context.close();
    }

    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await visitHome(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await context.close();
  });

  test('home and mobile navigation remain useful without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 800 },
    });
    const page = await context.newPage();
    await visitHome(page);

    const sections = page.locator('main > [data-home-section]');
    await expect(sections).toHaveCount(HOME_SECTIONS.length);
    await expect(page.locator('[data-home-section="identity"] h1')).toBeVisible();
    await expect(page.locator('[data-home-research-lane]').first()).toBeVisible();
    await expect(page.locator('[data-home-section="contact"] a[href^="mailto:"]')).toBeVisible();
    for (const route of CORE_ROUTES) {
      await expect(page.locator('#site-navigation').getByRole('link', { name: route, exact: true })).toBeVisible();
    }
    const more = page.locator('#site-navigation [data-more-navigation]');
    const moreSummary = more.locator('summary');
    await expect(moreSummary).toBeVisible();
    await moreSummary.click();
    for (const route of OTHER_ROUTES) {
      await expect(more.getByRole('link', { name: route, exact: true })).toBeVisible();
    }
    await context.close();
  });

  test('skip link focuses the main landmark', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('home never overflows horizontally from 320px through 1440px', async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await expectNoHorizontalOverflow(page, width);
    }
  });

  test('current status is inside its rendered ISO range', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const status = page.locator('[data-current-status]');
    const [asOf, starts, ends] = await Promise.all([
      status.getAttribute('data-as-of'),
      status.getAttribute('data-start-date'),
      status.getAttribute('data-end-date-exclusive'),
    ]);
    expect(asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(starts).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ends).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(starts <= asOf && asOf < ends).toBe(true);

    if (asOf >= '2026-06-01' && asOf < '2026-09-01') {
      await expect(status).toContainText('UIUC');
      await expect(status).not.toContainText('IQVIA');
    }
  });
});
