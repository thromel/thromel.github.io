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

test('SHIFT publication detail page shows ACL ARR Oct 2026 in-review metadata and three authors', async ({
  page,
}) => {
  await page.goto('/publications/romel2026shift/');
  const mainText = await page.locator('main').textContent();
  expect(mainText).toContain(
    'Choice as an Attack: Auditing Aligned Backdoor Attacks in LLM Agents',
  );
  expect(mainText).toContain('Tanzim Hossain Romel');
  expect(mainText).toContain('Kawshik Kumar Paul');
  expect(mainText).toContain('Chowdhury Mohammad Rakin Haider');
  expect(mainText).toContain('In review at ACL ARR (October 2026)');
  expect(mainText).toContain('75–100%');
  expect(mainText).toContain('62.5–100%');
});

test('SHIFT preview thumbnail loads on desktop publications and projects pages', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  for (const route of ['/publications/', '/projects/']) {
    await page.goto(route);
    const img = page.locator('img[src*="shift-audit.webp"]');
    await expect(img).toBeVisible();
    await img.scrollIntoViewIfNeeded();
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth, `SHIFT thumbnail broken on ${route}`).toBeGreaterThan(0);
  }
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

// ── Route accessibility, View Transitions, search, and legacy redirects ───────

test('all project cards link internally and ctxhelm opens case study', async ({ page }) => {
  await page.goto('/projects/');
  const hrefs = await page
    .locator('.card[data-href]')
    .evaluateAll((cards) => cards.map((c) => c.getAttribute('data-href') ?? ''));

  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href).toMatch(/^\/projects\/[^/]+\/$/);
  }

  await page.locator('.card[data-href="/projects/ctxhelm/"] .card-title-link').click();
  await page.waitForURL(/\/projects\/ctxhelm\/$/);
  await expect(page.locator('h1')).toContainText('ctxhelm');
});

test('sitemap URLs all resolve with HTTP 200 and exclude removed pages', async ({ page }) => {
  const res = await page.request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(0);

  for (const removed of ['/teaching/', '/people/', '/books/', '/repositories/']) {
    expect(xml).not.toContain(removed);
  }

  for (const loc of locs) {
    const pathname = new URL(loc).pathname;
    const check = await page.request.get(pathname);
    expect(check.status(), `Expected 200 for ${pathname}`).toBe(200);
  }
});

test('view transitions navigation and interactive controls work without console or page errors', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  await page.locator('#site-navbar a.nav-link[href="/publications/"]').click();
  await page.waitForURL(/\/publications\/$/);
  const pubSearch = page.getByRole('searchbox', { name: 'Search publications' });
  await expect(pubSearch).toHaveAttribute('data-hydrated', 'true');
  await pubSearch.fill('Backdoor');
  await expect(page.locator('.pub-count')).toContainText('Showing 1 of');

  await page.locator('#site-navbar a.nav-link[href="/projects/"]').click();
  await page.waitForURL(/\/projects\/$/);
  await page.locator('.card[data-href="/projects/ctxhelm/"] .card-title-link').click();
  await page.waitForURL(/\/projects\/ctxhelm\/$/);

  await page.locator('#site-navbar a.nav-link[href="/blog/"]').click();
  await page.waitForURL(/\/blog\/$/);
  await page.locator('a.post-title').first().click();
  await page.waitForURL(/\/blog\/[^/]+\/$/);

  for (const href of ['/cv/', '/news/', '/resources/']) {
    await page.locator(`#site-navbar a.nav-link[href="${href}"]`).click();
    await page.waitForURL(new RegExp(`${href.replace(/\//g, '\\/')}$`));
  }

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('search modal returns ctxhelm results cleanly under rapid typing', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  await page.locator('[data-search-toggle]:visible').first().click();
  const modalInput = page.getByRole('textbox', { name: 'Search or jump to…' });
  await expect(modalInput).toBeVisible();
  await expect(modalInput).toBeFocused();
  await modalInput.pressSequentially('ctxhelm', { delay: 15 });

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const nk = document.querySelector('#ninja-search') as { data?: Array<{ id?: string }> };
          return (nk?.data ?? []).some((item) => item.id === '/projects/ctxhelm/');
        }),
      { timeout: 5000 },
    )
    .toBe(true);
});

test('legacy Jekyll redirects and kill-switch service worker resolve cleanly', async ({ page }) => {
  const sw = await page.request.get('/sw.js');
  expect(sw.status()).toBe(200);

  const legacyPairs: Array<[string, RegExp]> = [
    ['/blog/2025/05/28/vibe-coding/', /\/blog\/vibe-coding\/$/],
    ['/projects.html', /\/projects\/$/],
    ['/research/reagent-plus-plus.html', /\/projects\/research-reagent-plus-plus\/$/],
    ['/projects/bangla_digit_recognition/', /\/projects\/bangla-digit-recognition\/$/],
  ];

  for (const [from, toPattern] of legacyPairs) {
    await page.goto(from);
    await page.waitForURL(toPattern, { timeout: 5000 });
  }
});

test('long blog posts have valid internal TOC anchor targets without raw kramdown syntax', async ({
  page,
}) => {
  for (const slug of ['dotnet-tests', 'getting-started-with-kubernetes-microservices']) {
    await page.goto(`/blog/${slug}/`);
    const bodyText = await page.locator('#post-content').textContent();
    expect(bodyText).not.toContain('{#');

    const missingTargets = await page.evaluate(() => {
      const links = [...document.querySelectorAll<HTMLAnchorElement>('#post-content a[href^="#"]')];
      return links
        .map((a) => a.getAttribute('href')?.slice(1) ?? '')
        .filter((id) => id.length > 0 && !document.getElementById(id));
    });
    expect(missingTargets, `Broken anchors in ${slug}`).toEqual([]);
  }
});
