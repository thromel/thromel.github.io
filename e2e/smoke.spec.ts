import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const siteSource = readFileSync(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const configuredAuthorName =
  siteSource.match(/author:\s*\{[\s\S]*?name:\s*'([^']+)'/)?.[1] ?? 'Home';

const CORE_ROUTES = [
  '/',
  '/publications/',
  '/projects/',
  '/cv/',
  '/blog/',
  '/news/',
  '/resources/',
];

// ── Page load smoke tests ─────────────────────────────────────────────────────

test('homepage loads with author name in title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(
    new RegExp(configuredAuthorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  await expect(page.locator('main')).toBeVisible();
});

test('blog listing page loads', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveTitle(/blog/i);
});

test('publications page loads', async ({ page }) => {
  await page.goto('/publications/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveTitle(/publications/i);
});

test('projects page loads', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveTitle(/projects/i);
});

test('cv page loads', async ({ page }) => {
  await page.goto('/cv/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveTitle(/cv/i);
});

test('news page loads', async ({ page }) => {
  await page.goto('/news/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveTitle(/news/i);
});

test('resources page loads', async ({ page }) => {
  await page.goto('/resources/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveTitle(/resources/i);
});

// ── Responsive layout & zero horizontal overflow ──────────────────────────────

for (const vp of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`no horizontal overflow on core routes (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const route of CORE_ROUTES) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${route} overflowed on ${vp.name}`).toBeLessThanOrEqual(1);
    }
  });
}

// ── Dark mode & theme-color meta ──────────────────────────────────────────────

test('clicking theme toggle switches data-theme, updates theme-color, and persists', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const html = page.locator('html');
  const initialTheme = await html.getAttribute('data-theme');
  const expectedNextTheme = initialTheme === 'dark' ? 'light' : 'dark';
  const expectedMetaColor = expectedNextTheme === 'dark' ? '#111317' : '#faf9f6';

  await page.locator('[data-light-toggle]:visible').first().click();

  await expect(html).toHaveAttribute('data-theme', expectedNextTheme);
  await expect(page.locator('meta#theme-color')).toHaveAttribute('content', expectedMetaColor);

  await page.goto('/blog/');
  await expect(html).toHaveAttribute('data-theme', expectedNextTheme);
  await expect(page.locator('meta#theme-color')).toHaveAttribute('content', expectedMetaColor);
});

test('dark mode preference persists after navigation', async ({ page }) => {
  await page.goto('/');

  // Set dark mode via localStorage (simulates user toggling to dark)
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  // Navigate away and back — theme should be restored by the inline script
  await page.goto('/blog/');
  const theme = await page.locator('html').getAttribute('data-theme');
  expect(theme).toBe('dark');
});

test('light mode preference persists after navigation', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  });

  await page.goto('/publications/');
  const theme = await page.locator('html').getAttribute('data-theme');
  expect(theme).toBe('light');
});

// ── Navigation & interactive controls ─────────────────────────────────────────

test('navbar links are present on homepage', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav).toBeVisible();
});

test('mobile navbar menu opens, closes on Escape, and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const toggle = page.locator('#navbar-toggler');
  const menu = page.locator('#navbar-collapse');

  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('publications search filters, clears, and BibTeX panel shows copy button', async ({
  page,
}) => {
  await page.goto('/publications/');

  const count = page.locator('.pub-count');
  const initialCountText = await count.textContent();

  const search = page.getByRole('searchbox', { name: 'Search publications' });
  await search.fill('no-matching-publication-query-xyz');
  await expect(count).toContainText('Showing 0 of');

  const clearBtn = page.getByRole('button', { name: 'Clear search' });
  await expect(clearBtn).toBeVisible();
  await clearBtn.click();
  await expect(count).toHaveText(initialCountText ?? '');

  await page.locator('button.bibtex').first().click();
  const bibPanel = page.locator('.pub-panel.bibtex:not([hidden])').first();
  await expect(bibPanel).toBeVisible();
  await expect(bibPanel.locator('.pub-copy-btn')).toBeVisible();
});

test('cv page renders clickable links without raw markdown syntax', async ({ page }) => {
  await page.goto('/cv/');
  const main = page.locator('main');
  await expect(main.locator('a[href*="amii.ca"]').first()).toBeVisible();
  const bodyText = await main.textContent();
  expect(bodyText).not.toContain('](');
});

test('project detail page renders clean markdown without raw kramdown attributes', async ({
  page,
}) => {
  await page.goto('/projects/ctxhelm/');
  const bodyText = await page.locator('main').textContent();
  expect(bodyText).not.toContain('{:target=');
});

test('404 page returns not-found response', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
});
