const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP = { width: 1280, height: 820 };
const MOBILE = { width: 390, height: 844 };

const contributionItem = {
  html_url: 'https://github.com/example/repo/pull/7',
  title: 'Tighten proof surface behavior',
  state: 'closed',
  pull_request: { merged_at: '2026-05-01T00:00:00Z' },
  repository_url: 'https://api.github.com/repos/example/repo',
  created_at: '2026-04-29T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  labels: [{ name: 'ux', color: '1d4ed8' }],
  number: 7,
  user: { login: 'thromel' },
};

async function expectNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${label} should not overflow horizontally.`).toBeLessThanOrEqual(dimensions.width + 1);
}

async function mockGitHub(page, status, body) {
  await page.route('https://api.github.com/search/issues*', async (route) => {
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

function parseRgb(value) {
  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) return rgbMatch.slice(1, 4).map(Number);

  const srgbMatch = value.match(/color\(srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/);
  if (srgbMatch) return srgbMatch.slice(1, 4).map((channel) => Math.round(Number(channel) * 255));

  return null;
}

function relativeLuminance([red, green, blue]) {
  return [red, green, blue]
    .map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

test('projects page separates featured evidence from archive work with stable media', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(`${BASE_URL}/projects`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Featured Evidence' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Capstones and Build Narratives' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Compact Project Index' })).toBeVisible();
  await expect(page.locator('.project-feature-list--selected .project-feature-entry')).toHaveCount(6);
  await expect(page.locator('.project-feature-list--selected')).toContainText('ctxhelm');

  const firstMediaWidth = await page.locator('.project-feature-list--selected .project-feature-entry__media').first().evaluate((node) => node.getBoundingClientRect().width);
  expect(firstMediaWidth).toBeGreaterThanOrEqual(120);
  expect(firstMediaWidth).toBeLessThanOrEqual(150);

  const tagCounts = await page.locator('.project-feature-entry').evaluateAll((entries) =>
    entries.slice(0, 6).map((entry) => entry.querySelectorAll('.academic-tag').length)
  );
  expect(tagCounts.every((count) => count <= 5)).toBe(true);
});

test('projects page remains compact and non-overflowing on mobile', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto(`${BASE_URL}/projects`, { waitUntil: 'domcontentloaded' });

  await expectNoHorizontalOverflow(page, 'Projects mobile');
  const firstMediaWidth = await page.locator('.project-feature-entry__media').first().evaluate((node) => node.getBoundingClientRect().width);
  expect(firstMediaWidth).toBeGreaterThanOrEqual(300);
  expect(firstMediaWidth).toBeLessThanOrEqual(360);
  await expect(page.locator('.project-feature-entry').first()).toContainText('PatchSmith');
  await expect(page.locator('.project-feature-list--selected')).toContainText('ctxhelm');
});

test('contributions page shows curated proof before live GitHub activity', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await mockGitHub(page, 200, { total_count: 1, items: [contributionItem] });
  await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.contribution-highlight')).toHaveCount(7);
  for (const label of ['RefactoringMiner', 'SREGym', 'EF Core', 'GenHTTP', 'deepagents', 'TypeScript']) {
    await expect(page.locator('.contributions-curated')).toContainText(label);
  }
  await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('#contributions-section')).toContainText('Tighten proof surface behavior');
});

test('contributions curated proof remains useful when GitHub is rate limited', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await mockGitHub(page, 403, { message: 'API rate limit exceeded' });
  await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.contribution-highlight').first()).toContainText('RefactoringMiner');
  await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#error-state-message')).toContainText('rate-limited');
  await expectNoHorizontalOverflow(page, 'Contributions mobile rate-limit state');
});

test('core pages emit canonical Open Graph and Twitter metadata', async ({ page }) => {
  for (const path of ['/', '/projects', '/contributions', '/publications']) {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/thromel\.github\.io\/.+|^https:\/\/thromel\.github\.io\/$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/assets\/images\/etc\/preview\.png$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  }
});

test('dark mode keeps card text readable on contribution surfaces', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await mockGitHub(page, 403, { message: 'API rate limit exceeded' });
  await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const colors = await page.locator('.contribution-highlight').first().evaluate((node) => {
    const style = getComputedStyle(node);
    return { color: style.color, backgroundColor: style.backgroundColor };
  });
  const foreground = parseRgb(colors.color);
  const background = parseRgb(colors.backgroundColor);
  expect(foreground).not.toBeNull();
  expect(background).not.toBeNull();
  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
});
