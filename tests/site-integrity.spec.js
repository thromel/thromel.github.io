const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const SITE_ROOT = path.join(ROOT, '_site');
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const CANONICAL_ORIGIN = 'https://tanzimhromel.com';

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

function siteFiles(extension) {
  return filesUnder(SITE_ROOT)
    .filter((file) => !extension || path.extname(file).toLowerCase() === extension);
}

function decodeAttribute(value) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)));
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? decodeAttribute(match[2].trim()) : null;
}

function routeForHtml(file) {
  const relative = path.relative(SITE_ROOT, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  return `/${relative}`;
}

function htmlForRoute(route) {
  const target = candidatesForPathname(route).find(fs.existsSync);
  if (!target) throw new Error(`Missing built route: ${route}`);
  return fs.readFileSync(target, 'utf8');
}

function candidatesForPathname(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (_) {
    decoded = pathname;
  }
  const relative = decoded.replace(/^\/+/, '');
  const exact = path.join(SITE_ROOT, relative);
  if (decoded.endsWith('/')) return [path.join(exact, 'index.html')];
  return [exact, `${exact}.html`, path.join(exact, 'index.html')];
}

function resolveSiteTarget(reference, sourceRoute) {
  if (!reference || reference.startsWith('#')) {
    const url = new URL(sourceRoute, CANONICAL_ORIGIN);
    if (reference) url.hash = reference;
    return { url, file: candidatesForPathname(url.pathname).find(fs.existsSync) };
  }
  if (/^(?:mailto|tel|javascript|data):/i.test(reference)) return null;

  let url;
  try {
    url = new URL(reference, new URL(sourceRoute, CANONICAL_ORIGIN));
  } catch (_) {
    return { invalid: reference };
  }
  if (url.origin !== CANONICAL_ORIGIN) return null;
  return { url, file: candidatesForPathname(url.pathname).find(fs.existsSync) };
}

function hasFragment(file, fragment) {
  if (!file || path.extname(file).toLowerCase() !== '.html') return false;
  let decoded;
  try {
    decoded = decodeURIComponent(fragment);
  } catch (_) {
    decoded = fragment;
  }
  const html = fs.readFileSync(file, 'utf8');
  return [...html.matchAll(/\s(?:id|name)\s*=\s*(["'])(.*?)\1/gi)]
    .some((match) => decodeAttribute(match[2]) === decoded);
}

function assetReferencesFromHtml(html) {
  const references = [];
  for (const tag of html.match(/<(?:img|script|source|video|audio|iframe|object|embed|link)\b[^>]*>/gi) || []) {
    const tagName = (tag.match(/^<([a-z]+)/i) || [])[1]?.toLowerCase();
    const rel = (attribute(tag, 'rel') || '').toLowerCase().split(/\s+/);
    const names = ['src', 'data-src', 'poster', 'data'];
    if (tagName === 'link' && rel.some((value) => ['stylesheet', 'icon', 'preload', 'modulepreload', 'manifest', 'apple-touch-icon'].includes(value))) names.push('href');
    for (const name of names) {
      const value = attribute(tag, name);
      if (value) references.push(value);
    }
    for (const name of ['srcset', 'data-srcset']) {
      const value = attribute(tag, name);
      if (!value || value.startsWith('data:')) continue;
      for (const candidate of value.split(',')) {
        const reference = candidate.trim().split(/\s+/)[0];
        if (reference) references.push(reference);
      }
    }
  }
  return references;
}

test.describe('built-site integrity', () => {
  test('production output excludes workspace-only and generated artifacts', () => {
    const forbiddenRoots = [
      'AGENTS.md',
      'browser-console-tests.js',
      'docs',
      'figures',
      'files',
      'learning.html.backup',
      'manual-testing-script.md',
      'output',
      'package-lock.json',
      'package.json',
      'playwright-report',
      'scripts',
      'test-results',
      'tests',
      'validate-latex.py',
    ];
    const leakedRoots = forbiddenRoots.filter((entry) => fs.existsSync(path.join(SITE_ROOT, entry)));
    const leakedGenerated = filesUnder(SITE_ROOT)
      .map((file) => path.relative(SITE_ROOT, file))
      .filter((file) => /(?:\.backup|\.aux|\.log|\.out|\.csv)$/i.test(file));

    expect(leakedRoots, `Workspace-only output:\n${leakedRoots.join('\n')}`).toEqual([]);
    expect(leakedGenerated, `Generated output:\n${leakedGenerated.join('\n')}`).toEqual([]);
  });

  test('every built HTML route has one document heading and the debug page is excluded', () => {
    const failures = [];
    for (const file of siteFiles('.html')) {
      const count = (fs.readFileSync(file, 'utf8').match(/<h1\b/gi) || []).length;
      if (count !== 1) failures.push(`${routeForHtml(file)} -> ${count} h1 elements`);
    }

    expect(failures, failures.join('\n')).toEqual([]);
    expect(fs.existsSync(path.join(SITE_ROOT, 'debug.html'))).toBe(false);
    expect(fs.existsSync(path.join(SITE_ROOT, 'debug', 'index.html'))).toBe(false);
  });

  test('long-form content images reserve space and decode asynchronously', () => {
    const failures = [];
    for (const file of siteFiles('.html')) {
      const route = routeForHtml(file);
      if (!route.startsWith('/blog/') && !route.startsWith('/showcase/projects/')) continue;
      const html = fs.readFileSync(file, 'utf8');
      const contentStart = html.search(/class=["'][^"']*(?:post-content|showcase-content)[^"']*["']/i);
      const mainEnd = contentStart >= 0 ? html.indexOf('</main>', contentStart) : -1;
      const content = contentStart >= 0 ? html.slice(contentStart, mainEnd >= 0 ? mainEnd : undefined) : '';
      for (const tag of content.match(/<img\b[^>]*>/gi) || []) {
        const missing = ['width', 'height', 'decoding'].filter((name) => !attribute(tag, name));
        if (missing.length) failures.push(`${route} -> image missing ${missing.join(', ')}: ${attribute(tag, 'src') || '(missing src)'}`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('displayed record dates are machine-readable without calendar-day drift', () => {
    const expectedDates = [
      ['/showcase/projects/ctxhelm/', '2026-05-10', 'May 10, 2026'],
      ['/showcase/projects/extending-llm-api-contract-analysis-a-refined-taxonomy-and-empirical-study/', '2025-01-15', 'January 15, 2025'],
      ['/showcase/projects/tcp-vegas-plus/', '2022-05-15', 'May 15, 2022'],
      ['/blog/2025/01/20/leveraging-ai-tools-software-engineering/', '2025-01-20', 'January 20, 2025'],
    ];
    for (const [route, datetime, label] of expectedDates) {
      expect(htmlForRoute(route), route).toContain(`<time class="${route.startsWith('/blog/') ? 'post-date' : 'timeline-date'}" datetime="${datetime}">${label}</time>`);
    }

    const routeMinimums = new Map([
      ['/blog/', 5],
      ['/education/', 7],
      ['/achievements/', 6],
      ['/news/', 1],
    ]);
    for (const [route, minimum] of routeMinimums) {
      const times = htmlForRoute(route).match(/<time\b[^>]*datetime=["'](?:\d{4}|\d{4}-\d{2}|\d{4}-\d{2}-\d{2})["'][^>]*>/gi) || [];
      expect(times.length, `${route} should expose at least ${minimum} semantic dates`).toBeGreaterThanOrEqual(minimum);
    }

    const publications = htmlForRoute('/publications/');
    for (const match of publications.matchAll(/publication-record__year[^>]*>\s*<time\s+datetime=["'](\d{4})["']>(\d{4})<\/time>/gi)) {
      expect(match[1], 'publication year datetime should match its visible year').toBe(match[2]);
    }

    const experience = htmlForRoute('/experience/');
    expect(experience).toContain('<time datetime="2026-06-01">June 2026</time>–<time datetime="2026-08">August 2026</time>');
    expect(experience).toContain('<time datetime="2023-06-01">June 2023</time>–<time datetime="2026-06">June 2026</time>');
    expect(experience).toContain('Starting <time datetime="2026-09-01">September 1, 2026</time>');
  });

  test('secondary indexes publish route-specific descriptions', () => {
    const expectations = new Map([
      ['/education/', 'Degree history, selected coursework'],
      ['/achievements/', 'Competition results, academic honors'],
      ['/news/', 'Dated updates on graduate study'],
      ['/learning/', 'Current books, selected university courses'],
    ]);
    for (const [route, fragment] of expectations) {
      const html = htmlForRoute(route);
      const description = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      expect(description && decodeAttribute(description[1]), route).toContain(fragment);
    }
  });

  test('CV actions resolve to the published PDF and repository source', () => {
    const html = htmlForRoute('/cv/');
    expect(html).toContain('href="/assets/pdf/cv.pdf"');
    expect(html).toContain('href="https://github.com/thromel/thromel.github.io/blob/main/_posts/cv.tex"');
    expect(html).not.toMatch(/github\.com\/{2,}/);
  });

  test('internal links and fragments resolve to built destinations', () => {
    const failures = [];
    for (const file of siteFiles('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const sourceRoute = routeForHtml(file);
      for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
        const href = attribute(tag, 'href');
        if (!href) continue;
        const target = resolveSiteTarget(href, sourceRoute);
        if (!target) continue;
        if (target.invalid || !target.file) {
          failures.push(`${sourceRoute} -> ${href}`);
          continue;
        }
        const fragment = target.url.hash.slice(1);
        if (fragment && !hasFragment(target.file, fragment)) failures.push(`${sourceRoute} -> ${href} (missing fragment)`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('published pages do not contain placeholder links', () => {
    const failures = [];
    for (const file of siteFiles('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
        const href = attribute(tag, 'href');
        if (!href || href === '#') failures.push(`${routeForHtml(file)} -> ${tag}`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('built HTML and CSS reference existing local assets', () => {
    const failures = [];
    for (const file of siteFiles('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const sourceRoute = routeForHtml(file);
      for (const reference of assetReferencesFromHtml(html)) {
        const target = resolveSiteTarget(reference, sourceRoute);
        if (target && (target.invalid || !target.file)) failures.push(`${sourceRoute} -> ${reference}`);
      }
    }
    for (const file of siteFiles('.css')) {
      const css = fs.readFileSync(file, 'utf8');
      const sourceRoute = `/${path.relative(SITE_ROOT, file).split(path.sep).join('/')}`;
      for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
        const reference = decodeAttribute(match[2].trim());
        if (!reference || reference.startsWith('#') || reference.startsWith('data:')) continue;
        const target = resolveSiteTarget(reference, sourceRoute);
        if (target && (target.invalid || !target.file)) failures.push(`${sourceRoute} -> ${reference}`);
      }
    }
    expect([...new Set(failures)], [...new Set(failures)].join('\n')).toEqual([]);
  });

  test('new-tab links use both opener protections', () => {
    const failures = [];
    for (const file of siteFiles('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const sourceRoute = routeForHtml(file);
      for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
        if ((attribute(tag, 'target') || '').toLowerCase() !== '_blank') continue;
        const rel = new Set((attribute(tag, 'rel') || '').toLowerCase().split(/\s+/).filter(Boolean));
        if (!rel.has('noopener') || !rel.has('noreferrer')) failures.push(`${sourceRoute} -> ${attribute(tag, 'href') || '(missing href)'}`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('new-tab links announce the browsing-context change in static HTML', () => {
    const failures = [];
    for (const file of siteFiles('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const sourceRoute = routeForHtml(file);
      for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
        if ((attribute(tag, 'target') || '').toLowerCase() !== '_blank') continue;
        if (!/opens in a new tab/i.test(attribute(tag, 'aria-label') || '')) {
          failures.push(`${sourceRoute} -> ${attribute(tag, 'href') || '(missing href)'}`);
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('published prose avoids unsupported promotional superlatives', () => {
    const failures = [];
    const inflated = /\b(?:revolutionary|revolutionized|world-class|cutting-edge|game-changing|groundbreaking)\b/i;
    for (const file of siteFiles('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const main = (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || '';
      const prose = main
        .replace(/<(?:script|style)\b[\s\S]*?<\/(?:script|style)>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');
      const match = prose.match(inflated);
      if (match) failures.push(`${routeForHtml(file)} -> ${match[0]}`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('canonical metadata, sitemap, and robots use the custom host', () => {
    const sitemap = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
    const robots = fs.readFileSync(path.join(SITE_ROOT, 'robots.txt'), 'utf8');
    expect(sitemap).not.toContain('https://thromel.github.io');
    expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).origin))
      .toEqual(expect.arrayContaining([CANONICAL_ORIGIN]));
    expect(robots).toContain(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`);

    const failures = [];
    for (const file of siteFiles('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
      if (!canonical || new URL(decodeAttribute(canonical[1])).origin !== CANONICAL_ORIGIN) failures.push(routeForHtml(file));
    }
    expect(failures, `Missing or non-canonical host:\n${failures.join('\n')}`).toEqual([]);
  });

  test('legacy research routes are useful without script redirects and point to stable records', async ({ page }) => {
    await page.goto(`${BASE_URL}/research/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#shift')).toHaveCount(1);
    await expect(page.locator('#verified-schema-generation')).toHaveCount(1);

    const routes = [
      { path: '/research/blockchain-healthcare/', heading: /Patient-Centric Blockchain Framework/, href: '/publications/' },
      { path: '/research/llm-api-contracts/', heading: /Design by Contract for LLM APIs/, href: '/showcase/projects/extending-llm-api-contract-analysis-a-refined-taxonomy-and-empirical-study/' },
      { path: '/research/multi-agent-db-schema/', heading: /VeriSchema/, href: '/research/#verified-schema-generation' },
      { path: '/research/ureporter/', heading: /Sentiment Analysis of Anonymous Crisis Reports/, href: '/publications/' },
      { path: '/research/reagent-plus-plus/', heading: /The Choice Can Be the Attack/, href: '/research/#shift' },
    ];

    for (const route of routes) {
      const response = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded' });
      expect(response.status(), route.path).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
      await expect(page.locator('main').locator(`a[href="${route.href}"]`)).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${CANONICAL_ORIGIN}${route.path}`);
      const scripts = await page.locator('script:not([src])').allTextContents();
      expect(scripts.join('\n')).not.toMatch(/(?:window\.)?location\s*(?:\.href)?\s*=/);
    }
  });

  test('contribution refresh is single-flight and exposes a busy retry state', async ({ page }) => {
    let calls = 0;
    let release;
    const responseGate = new Promise((resolve) => { release = resolve; });
    await page.route('https://api.github.com/search/issues*', async (route) => {
      calls += 1;
      await responseGate;
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total_count: 47, items: [] }) }).catch(() => {});
    });
    await page.goto(`${BASE_URL}/contributions/`, { waitUntil: 'domcontentloaded' });

    const count = page.locator('[data-contribution-count]');
    const retry = page.getByRole('button', { name: 'Retry count' });
    await expect(count).toHaveAttribute('aria-busy', 'true');
    await expect(retry).toBeDisabled();
    await page.evaluate(() => {
      window.refreshContributionCount();
      window.refreshContributionCount();
    });
    expect(calls).toBe(1);

    release();
    await expect(count).toHaveAttribute('data-state', 'success');
    await expect(count).toHaveAttribute('aria-busy', 'false');
    await expect(retry).toBeEnabled();
  });

  test('contribution evidence remains available without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contributions/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-contribution-proof]')).toHaveCount(6);
    await expect(page.getByText('Live count unavailable without JavaScript. Selected contribution evidence is shown above.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry count' })).toHaveCount(0);
    await context.close();
  });
});
