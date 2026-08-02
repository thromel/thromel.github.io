const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const ROOT = path.resolve(__dirname, '..');
const ROUTES = [
  '/about',
  '/education',
  '/experience',
  '/achievements',
  '/news',
  '/learning',
  '/blog/',
  '/cv/',
  '/404.html',
  '/offline/',
];

test.describe('secondary route convergence', () => {
  test('secondary routes keep the shared research-core shell and no horizontal overflow', async ({ page }) => {
    for (const path of ROUTES) {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
        const navigation = page.locator('#site-navigation');
        await expect(navigation).toHaveCount(1);
        await expect(navigation.locator(':scope > a')).toHaveCount(5);
        await expect(navigation.locator('a[href="/research/"]')).toHaveCount(1);
        await expect(navigation.locator('a[href="/projects/"]')).toHaveCount(1);
        await expect(navigation.locator('a[href="/cv/"]')).toHaveCount(1);
        await expect(page.locator('main h1')).toBeVisible();
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
      }
    }
  });

  test('CV is a focused download surface rather than an embedded document viewer', async ({ page }) => {
    await page.goto(`${BASE_URL}/cv/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /download cv/i })).toHaveCount(1);
  });

  test('shared page and record headings use the compact type scale', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });

    for (const path of ['/about', '/research', '/publications', '/projects', '/education', '/experience']) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
      const size = await page.locator('main h1').first().evaluate((heading) => parseFloat(getComputedStyle(heading).fontSize));
      expect(size, `${path} h1`).toBeLessThanOrEqual(56);
    }

    await page.goto(`${BASE_URL}/education`, { waitUntil: 'domcontentloaded' });
    const degreeSize = await page.locator('.education-entry__degree').first().evaluate((heading) => parseFloat(getComputedStyle(heading).fontSize));
    expect(degreeSize, 'education degree heading').toBeLessThanOrEqual(36);

    await page.goto(`${BASE_URL}/experience`, { waitUntil: 'domcontentloaded' });
    const recordSize = await page.locator('.experience-record h3').first().evaluate((heading) => parseFloat(getComputedStyle(heading).fontSize));
    expect(recordSize, 'experience record heading').toBeLessThanOrEqual(24);
  });

  test('ML hosting research URL remains a readable no-JavaScript artifact page', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/research/ml-remote-code-execution/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main h1')).toContainText('Remote Code Execution');
    await expect(page.locator('main')).toContainText('arXiv');
    await context.close();
  });

  test('ctxhelm proof uses the canonical ledger grid and stacks cleanly on mobile', async ({ page }) => {
    const proofRoute = `${BASE_URL}/showcase/projects/ctxhelm/`;

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(proofRoute, { waitUntil: 'domcontentloaded' });
    const desktop = await page.locator('.ctxhelm-proof-board').evaluate((board) => {
      const header = board.querySelector('.ctxhelm-proof-board__header');
      const grid = board.querySelector('.ctxhelm-proof-grid');
      const firstRecord = grid.querySelector('article');
      return {
        boardRule: parseFloat(getComputedStyle(board).borderTopWidth),
        headerColumns: getComputedStyle(header).gridTemplateColumns.split(' ').length,
        headerGap: parseFloat(getComputedStyle(header).columnGap),
        gridColumns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        recordPadding: parseFloat(getComputedStyle(firstRecord).paddingBlockStart),
      };
    });
    expect(desktop).toEqual({
      boardRule: 1,
      headerColumns: 2,
      headerGap: 24,
      gridColumns: 2,
      recordPadding: 24,
    });

    await page.setViewportSize({ width: 320, height: 800 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const mobile = await page.locator('.ctxhelm-proof-board').evaluate((board) => {
      const grid = board.querySelector('.ctxhelm-proof-grid');
      const records = [...grid.querySelectorAll('article')];
      return {
        gridColumns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        everyFollowingRecordHasRule: records.slice(1).every((record) => parseFloat(getComputedStyle(record).borderTopWidth) === 1),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(mobile.gridColumns).toBe(1);
    expect(mobile.everyFollowingRecordHasRule).toBe(true);
    expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.clientWidth + 1);
  });

  test('long metadata uses body typography and removed project-card CSS stays deleted', async ({ page }) => {
    await page.goto(`${BASE_URL}/contributions/`, { waitUntil: 'domcontentloaded' });
    const typography = await page.locator('.contribution-record__area').first().evaluate((label) => {
      const style = getComputedStyle(label);
      return {
        fontFamily: style.fontFamily,
        bodyFont: getComputedStyle(document.body).fontFamily,
        fontSize: parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        textTransform: style.textTransform,
      };
    });
    expect(typography.fontFamily).toBe(typography.bodyFont);
    expect(typography.fontSize).toBe(16);
    expect(typography.fontWeight).toBe('400');
    expect(typography.textTransform).toBe('none');

    const stylesheet = fs.readFileSync(path.join(ROOT, 'assets/css/overhaul.css'), 'utf8');
    expect(stylesheet).not.toMatch(/\.project-card(?:[\s.{:#]|$)/);
  });
});
