const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const SITE_ROOT = path.join(ROOT, '_site');
const CANONICAL_ORIGIN = 'https://tanzimhromel.com';
const GENERIC_DESCRIPTION = 'Personal Academic Homepage';

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)));
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? decodeHtml(match[2].trim()) : null;
}

function routeForHtml(file) {
  const relative = path.relative(SITE_ROOT, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  return `/${relative}`;
}

function builtPages() {
  return filesUnder(SITE_ROOT)
    .filter((file) => path.extname(file).toLowerCase() === '.html')
    .map((file) => {
      const html = fs.readFileSync(file, 'utf8');
      const title = decodeHtml((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '');
      const descriptionTag = (html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i) || [])[0] || '';
      const canonicalTag = (html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i) || [])[0] || '';
      const robotsTag = (html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i) || [])[0] || '';
      return {
        file,
        html,
        route: routeForHtml(file),
        title,
        description: attribute(descriptionTag, 'content') || '',
        canonical: attribute(canonicalTag, 'href') || '',
        robots: attribute(robotsTag, 'content') || '',
      };
    });
}

function jsonLdObjects(html) {
  return [...html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
}

test.describe('SEO completeness', () => {
  test('blog and showcase routes have meaningful, unique descriptions', () => {
    const contentPages = builtPages().filter(({ route }) => (
      /^\/blog\/\d{4}\//.test(route) || route.startsWith('/showcase/')
    ));

    expect(contentPages.length).toBeGreaterThan(0);
    const descriptions = new Map();
    const failures = [];
    for (const page of contentPages) {
      if (page.description.length < 50 || page.description === GENERIC_DESCRIPTION) {
        failures.push(`${page.route} -> ${page.description || '(missing)'}`);
      }
      const duplicate = descriptions.get(page.description);
      if (duplicate) failures.push(`${page.route} duplicates ${duplicate}`);
      descriptions.set(page.description, page.route);
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('blog pagination has page-aware unique titles and descriptions', () => {
    const paginationPages = builtPages()
      .filter(({ route }) => route === '/blog/' || /^\/blog\/page\d+\/$/.test(route))
      .sort((left, right) => left.route.localeCompare(right.route));

    expect(paginationPages.length).toBeGreaterThan(1);
    expect(new Set(paginationPages.map(({ title }) => title)).size).toBe(paginationPages.length);
    expect(new Set(paginationPages.map(({ description }) => description)).size).toBe(paginationPages.length);
    for (const page of paginationPages.filter(({ route }) => route !== '/blog/')) {
      const pageNumber = Number(page.route.match(/page(\d+)/)[1]);
      expect(page.title).toContain(`Page ${pageNumber}`);
      expect(page.description).toContain(`Page ${pageNumber}`);
    }
  });

  test('sitemap exactly covers intended indexable HTML routes', () => {
    const sitemap = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
    const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeHtml(match[1]));
    const expected = builtPages()
      .filter(({ route, robots }) => route !== '/404.html' && !/\bnoindex\b/i.test(robots))
      .map(({ canonical }) => canonical)
      .sort();

    expect(new Set(locations).size).toBe(locations.length);
    expect(locations.every((location) => new URL(location).origin === CANONICAL_ORIGIN)).toBe(true);
    expect([...locations].sort()).toEqual(expected);
  });

  test('offline and archived orphan routes are noindex and absent from sitemap', () => {
    const pages = new Map(builtPages().map((page) => [page.route, page]));
    const sitemap = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
    for (const route of ['/offline/', '/research/llm-api-contracts/']) {
      expect(pages.get(route)?.robots).toMatch(/\bnoindex\b/i);
      expect(sitemap).not.toContain(`${CANONICAL_ORIGIN}${route}`);
    }
  });

  test('every blog post emits article Open Graph and BlogPosting JSON-LD', () => {
    const posts = builtPages().filter(({ route }) => /^\/blog\/\d{4}\//.test(route));
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      const ogTypeTag = (post.html.match(/<meta\b[^>]*\bproperty=["']og:type["'][^>]*>/i) || [])[0] || '';
      expect(attribute(ogTypeTag, 'content'), post.route).toBe('article');
      const schema = jsonLdObjects(post.html).find((entry) => entry['@type'] === 'BlogPosting');
      expect(schema, post.route).toBeTruthy();
      expect(schema.headline).toBeTruthy();
      expect(schema.description).toBe(post.description);
      expect(schema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(schema.author?.name).toBe('Tanzim Hossain Romel');
      expect(schema.mainEntityOfPage?.['@id']).toBe(post.canonical);
    }
  });

  test('every HTML page advertises the generated Atom feed', () => {
    expect(fs.existsSync(path.join(SITE_ROOT, 'feed.xml'))).toBe(true);
    const failures = [];
    for (const page of builtPages()) {
      const feedTag = (page.html.match(/<link\b[^>]*\brel=["']alternate["'][^>]*\btype=["']application\/atom\+xml["'][^>]*>/i) || [])[0] || '';
      if (attribute(feedTag, 'href') !== `${CANONICAL_ORIGIN}/feed.xml`) failures.push(page.route);
    }
    expect(failures, `Missing feed autodiscovery:\n${failures.join('\n')}`).toEqual([]);
  });
});
