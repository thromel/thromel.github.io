const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const HOME_SECTIONS = [
  'identity',
  'selected-evidence',
  'research-agenda',
  'engineering-experience',
  'outputs-proof',
  'recent-trajectory',
  'contact',
];
const PRIMARY_ROUTES = [
  { label: 'Research', href: '/research/' },
  { label: 'Engineering', href: '/projects/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Experience', href: '/experience/' },
  { label: 'CV', href: '/cv/' },
];

async function visitHome(page) {
  if (!page.__portfolioExternalAssetsBlocked) {
    await page.route(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//, (route) => route.abort());
    page.__portfolioExternalAssetsBlocked = true;
  }
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

test.describe('dual-audience selective homepage contract', () => {
  test('home renders exactly seven selective regions in the approved order', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visitHome(page);

    const sections = page.locator('main > [data-home-section]');
    await expect(sections).toHaveCount(HOME_SECTIONS.length);
    await expect(sections.evaluateAll((elements) => elements.map((element) => element.dataset.homeSection))).resolves.toEqual(HOME_SECTIONS);

    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText('Tanzim Hossain Romel');
    await expect(page.locator('[data-home-evidence]')).toHaveCount(4);
    await expect(page.locator('[data-home-agenda]')).toHaveCount(3);
    await expect(page.locator('[data-home-experience]')).toHaveCount(2);
    await expect(page.locator('[data-home-publication]')).toHaveCount(2);
    await expect(page.locator('[data-home-contribution]')).toHaveCount(3);
    await expect(page.locator('[data-home-milestone]')).toHaveCount(3);

    const evidenceTypes = await page.locator('[data-home-evidence]').evaluateAll((records) => records.map((record) => record.dataset.homeEvidenceType));
    expect(evidenceTypes).toEqual(['research', 'engineering', 'research', 'engineering']);

    const main = page.locator('main');
    await expect(main).not.toContainText(/\bGTA\b|\bGRA\b|\bGRAF\b/);
    await expect(main).not.toContainText(/open-source program analysis/i);
    await expect(page.locator('[data-home-affiliation-logo]')).toHaveCount(1);
    await expect(page.locator('[data-home-work-logo]')).toHaveCount(2);
    await expect(page.locator('[data-home-engineering-skill], [data-home-metric]')).toHaveCount(0);
  });

  test('first viewport starts with the Alberta status, exact positioning copy, paths, and portrait', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visitHome(page);

    const identity = page.locator('[data-home-section="identity"]');
    const status = identity.locator('[data-current-status]');
    const asOf = await status.getAttribute('data-as-of');
    if (asOf < '2026-09-01') {
      await expect(status).toContainText('University of Alberta · Incoming M.Sc. in Computing Science');
    } else {
      await expect(status).toContainText('University of Alberta · M.Sc. in Computing Science');
    }
    await expect(identity.locator('.home-identity__thesis')).toHaveText('I study how AI agents behave in real software systems—and how to make their decisions inspectable, reliable, and trustworthy.');
    await expect(identity.locator('.home-identity__bridge')).toHaveText('About three years of professional software-engineering experience, formerly at IQVIA.');
    await expect(identity.locator('.home-identity__interests')).toHaveText('AI4SE · LLM4Coding · Trustworthy AI · long-horizon coding agents · AI for SRE');

    const paths = identity.locator('.home-identity__paths a');
    await expect(paths).toHaveCount(3);
    await expect(paths.allTextContents()).resolves.toEqual(['Research', 'Engineering', 'CV']);
    await expect(identity.getByRole('link', { name: 'Research', exact: true })).toHaveAttribute('href', '/research/');
    await expect(identity.getByRole('link', { name: 'Engineering', exact: true })).toHaveAttribute('href', '/projects/');
    await expect(identity.getByRole('link', { name: 'CV', exact: true })).toHaveAttribute('href', '/cv/');

    const orderedItems = identity.locator('[data-current-status], h1, .home-identity__thesis, .home-identity__bridge, .home-identity__interests, .home-identity__paths, [data-home-portrait]');
    const followsContractOrder = await identity.evaluate((root) => {
      const selectors = ['[data-current-status]', 'h1', '.home-identity__thesis', '.home-identity__bridge', '.home-identity__interests', '.home-identity__paths', '[data-home-portrait]'];
      const elements = selectors.map((selector) => root.querySelector(selector));
      return elements.every(Boolean) && elements.slice(0, -1).every((element, index) => (
        element.compareDocumentPosition(elements[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING
      ));
    });
    expect(followsContractOrder).toBe(true);
    for (const item of await orderedItems.all()) {
      const box = await item.boundingBox();
      expect(box, 'first-view identity item should render').not.toBeNull();
      expect(box.y, 'first-view identity item should begin within the viewport').toBeLessThan(900);
    }

    const portrait = identity.locator('[data-home-portrait]');
    await expect(portrait).toHaveAttribute('width', '960');
    await expect(portrait).toHaveAttribute('height', '1280');
    await expect(portrait).toHaveAttribute('fetchpriority', 'high');
    await expect(portrait).toHaveAttribute('srcset', /romel-320\.webp 320w.*romel-640\.webp 640w.*romel\.webp 960w/);
    await expect(portrait).toHaveAttribute('sizes', '(max-width: 719px) 240px, 288px');
    await expect(portrait).not.toHaveAttribute('loading', 'lazy');
    expect(await portrait.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  });

  test('the closed 320px shell and all three audience paths fit in the first 800px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await visitHome(page);

    const headerBox = await page.locator('.site-header').boundingBox();
    expect(headerBox, 'closed mobile header should render').not.toBeNull();
    expect(headerBox.height).toBe(64);

    const brandBox = await page.locator('.site-brand').boundingBox();
    expect(brandBox, 'home wordmark should render').not.toBeNull();
    expect(brandBox.height).toBeGreaterThanOrEqual(44);

    const paths = page.locator('.home-identity__paths a');
    await expect(paths).toHaveCount(3);
    for (const path of await paths.all()) {
      const box = await path.boundingBox();
      expect(box, 'audience path should render').not.toBeNull();
      expect(box.y + box.height, 'audience path should end inside the first screen').toBeLessThanOrEqual(800);
    }

    const register = await page.locator('.home-identity__copy').evaluate((copy) => {
      const style = getComputedStyle(copy, '::before');
      const copyStyle = getComputedStyle(copy);
      return {
        content: style.content,
        display: style.display,
        borderLeftWidth: parseFloat(copyStyle.borderLeftWidth),
      };
    });
    expect(register.display).toBe('none');
    expect(register.content).toBe('none');
    expect(register.borderLeftWidth).toBe(0);
  });

  test('mobile navigation fails open when the shared shell script is unavailable', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.route('**/assets/js/site-shell.js*', (route) => route.abort());
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect.poll(() => page.locator('html').getAttribute('class'))
      .toContain('shell-failed');
    await expect(page.locator('html')).not.toHaveClass(/js-enabled|shell-ready/);
    await expect(page.locator('.site-header__controls')).toBeHidden();

    const navigation = page.locator('#site-navigation');
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Research', exact: true })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Engineering', exact: true })).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'CV', exact: true })).toBeVisible();

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  });

  test('hero gutters and section traces follow desktop and tablet geometry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visitHome(page);
    expect(await page.locator('.home-identity__grid').evaluate((grid) => parseFloat(getComputedStyle(grid).columnGap))).toBe(32);

    for (const width of [720, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await visitHome(page);
      expect(
        await page.locator('.home-identity__copy').evaluate((copy) => parseFloat(getComputedStyle(copy).borderLeftWidth)),
        `${width}px notebook margin`,
      ).toBe(1);
    }

    await page.setViewportSize({ width: 768, height: 900 });
    await visitHome(page);
    const tabletHero = await page.locator('.home-identity__grid').evaluate((grid) => {
      const style = getComputedStyle(grid);
      const columns = style.gridTemplateColumns.split(' ').map((value) => parseFloat(value));
      return { columnGap: parseFloat(style.columnGap), columns };
    });
    expect(tabletHero.columnGap).toBe(24);
    expect(tabletHero.columns).toHaveLength(2);
    expect(Math.abs(tabletHero.columns[0] - tabletHero.columns[1])).toBeLessThanOrEqual(1);

    const trace = page.locator('[data-home-section="selected-evidence"] .section-trace');
    const traceGeometry = await trace.evaluate((element) => {
      const index = element.firstElementChild.getBoundingClientRect();
      const content = element.lastElementChild.getBoundingClientRect();
      return {
        columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
        indexBottom: index.bottom,
        contentTop: content.top,
      };
    });
    expect(traceGeometry.columns).toBe(1);
    expect(traceGeometry.indexBottom).toBeLessThanOrEqual(traceGeometry.contentTop);
  });

  test('homepage surfaces, accent roles, and prose typography stay restrained', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visitHome(page);

    const roles = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--accent)';
      document.body.append(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();

      const regions = [...document.querySelectorAll('.home-region:not(.home-identity)')];
      const elevatedRegions = regions
        .filter((region) => getComputedStyle(region).backgroundColor !== 'rgba(0, 0, 0, 0)')
        .map((region) => region.dataset.homeSection);
      const interests = getComputedStyle(document.querySelector('.home-identity__interests'));
      const engineeringIndex = getComputedStyle(document.querySelector('.evidence-record--engineering .evidence-record__index'));
      const proofHeading = getComputedStyle(document.querySelector('.proof-ledger--open-source > h3'));

      return {
        accent,
        elevatedRegions,
        interestsFont: interests.fontFamily,
        bodyFont: getComputedStyle(document.body).fontFamily,
        interestsSize: parseFloat(interests.fontSize),
        interestsTransform: interests.textTransform,
        engineeringIndexColor: engineeringIndex.color,
        proofHeadingRule: proofHeading.borderBottomColor,
      };
    });

    expect(roles.elevatedRegions).toEqual(['selected-evidence']);
    expect(roles.interestsFont).toBe(roles.bodyFont);
    expect(roles.interestsSize).toBe(16);
    expect(roles.interestsTransform).toBe('none');
    expect(roles.engineeringIndexColor).toBe(roles.accent);
    expect(roles.proofHeadingRule).toBe(roles.accent);
  });

  test('record padding and grid gutters follow desktop, tablet, and mobile tokens', async ({ page }) => {
    const cases = [
      { width: 1280, gap: 32 },
      { width: 768, gap: 24 },
      { width: 320, gap: 24 },
    ];

    for (const contract of cases) {
      await page.setViewportSize({ width: contract.width, height: 900 });
      await visitHome(page);
      const geometry = await page.locator('[data-home-evidence]').first().evaluate((record) => {
        const style = getComputedStyle(record);
        return {
          columnGap: parseFloat(style.columnGap),
          paddingBlockStart: parseFloat(style.paddingBlockStart),
          paddingBlockEnd: parseFloat(style.paddingBlockEnd),
        };
      });
      expect(geometry.columnGap, `${contract.width}px record gutter`).toBe(contract.gap);
      expect(geometry.paddingBlockStart, `${contract.width}px record start padding`).toBe(24);
      expect(geometry.paddingBlockEnd, `${contract.width}px record end padding`).toBe(24);
    }
  });

  test('selected evidence and proof ledgers keep their semantic limits', async ({ page }) => {
    await visitHome(page);

    for (const record of await page.locator('[data-home-evidence]').all()) {
      await expect(record.locator('h3')).toHaveCount(1);
      await expect(record.locator('dt')).toHaveText(['Contribution', 'Evidence', 'Methods', 'Verified']);
      const methodCount = await record.locator('[data-home-method]').count();
      expect(methodCount).toBeGreaterThan(0);
      expect(methodCount).toBeLessThanOrEqual(5);
      expect(await record.locator('.record-links a').count()).toBeLessThanOrEqual(2);
      await expect(record.locator('time[datetime]')).toHaveCount(1);
    }

    await expect(page.locator('[data-home-evidence] [data-home-record-visual]')).toHaveCount(4);
    await expect(page.locator('[data-home-image]')).toHaveCount(3);
    await expect(page.locator('.evidence-record__visual--signal')).toHaveCount(1);
    await expect(page.locator('[data-home-contribution]')).toContainText(['Merged contribution', 'Merged contribution', 'Merged contribution']);

    for (const record of await page.locator('[data-home-experience]').all()) {
      await expect(record.locator('.engineering-outcome-row__outcomes > li')).toHaveCount(3);
    }
  });

  test('the hero name uses the display scale without widening narrow screens', async ({ page }) => {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await visitHome(page);
      const typography = await page.locator('[data-home-section="identity"] h1').evaluate((heading) => {
        const style = getComputedStyle(heading);
        return {
          fontSize: parseFloat(style.fontSize),
          lineHeight: parseFloat(style.lineHeight),
          height: heading.getBoundingClientRect().height,
          width: heading.getBoundingClientRect().width,
          parentWidth: heading.parentElement.getBoundingClientRect().width,
        };
      });
      expect(typography.fontSize, `${width}px hero display size`).toBeGreaterThanOrEqual(40);
      expect(typography.fontSize, `${width}px hero display size`).toBeLessThanOrEqual(56);
      expect(typography.height, `${width}px hero line count`).toBeLessThanOrEqual(typography.lineHeight * 3.1);
      expect(typography.width, `${width}px hero containment`).toBeLessThanOrEqual(typography.parentWidth + 1);
    }
  });

  test('Research, Engineering, and CV remain permanent routes in header, hero, and footer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visitHome(page);

    const header = page.locator('#site-navigation');
    for (const route of PRIMARY_ROUTES) {
      const link = header.getByRole('link', { name: route.label, exact: true });
      await expect(link).toHaveAttribute('href', route.href);
      await expect(link).toBeVisible();
    }

    for (const route of PRIMARY_ROUTES.filter(({ label }) => ['Research', 'Engineering', 'CV'].includes(label))) {
      await expect(page.locator('footer').getByRole('link', { name: route.label, exact: true })).toHaveAttribute('href', route.href);
    }

    await expect(page.locator('.home-identity__paths a[href="/research/"]')).toHaveCount(1);
    await expect(page.locator('.home-identity__paths a[href="/projects/"]')).toHaveCount(1);
    await expect(page.locator('.home-identity__paths a[href="/cv/"]')).toHaveCount(1);
  });

  test('mobile menu uses a 44px labelled disclosure, closes on Escape, and restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await visitHome(page);

    const menuToggle = page.locator('#site-menu-toggle');
    await expect(menuToggle).toHaveAttribute('id', 'site-menu-toggle');
    await expect(menuToggle).toHaveAccessibleName('Open navigation menu');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menuToggle).toHaveText('Menu');
    const bounds = await menuToggle.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menuToggle).toHaveAccessibleName('Close navigation menu');
    await expect(menuToggle).toHaveText('Close');
    for (const route of PRIMARY_ROUTES) {
      await expect(page.locator('#site-navigation').getByRole('link', { name: route.label, exact: true })).toBeVisible();
    }

    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menuToggle).toBeFocused();
  });

  test('theme follows the first-paint preference, exposes its action, and persists an override', async ({ browser }) => {
    for (const systemTheme of ['light', 'dark']) {
      const context = await browser.newContext({ colorScheme: systemTheme });
      const page = await context.newPage();
      await visitHome(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', systemTheme);
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', systemTheme === 'dark' ? '#0c1513' : '#f5f1e8');
      const toggle = page.getByRole('button', { name: 'Dark theme', exact: true });
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-pressed', systemTheme === 'dark' ? 'true' : 'false');
      await context.close();
    }

    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await visitHome(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const toggle = page.getByRole('button', { name: 'Dark theme', exact: true });
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f5f1e8');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
    await context.close();
  });

  test('homepage and permanent audience routes remain useful without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 800 },
    });
    const page = await context.newPage();
    await visitHome(page);

    await expect(page.locator('main > [data-home-section]')).toHaveCount(HOME_SECTIONS.length);
    await expect(page.locator('[data-home-section="identity"] h1')).toBeVisible();
    await expect(page.locator('[data-home-evidence]').first()).toBeVisible();
    await expect(page.locator('[data-home-section="contact"] a[href^="mailto:"]')).toBeVisible();
    await expect(page.locator('#site-menu-toggle')).toBeHidden();
    for (const route of PRIMARY_ROUTES) {
      await expect(page.locator('#site-navigation').getByRole('link', { name: route.label, exact: true })).toBeVisible();
    }
    await context.close();
  });

  test('skip link focuses the main landmark', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    const main = page.locator('main');
    await expect(main).toBeFocused();
    const focusStyle = await main.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth) };
    });
    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(3);
  });

  test('home never overflows horizontally from 320px through 1440px', async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await expectNoHorizontalOverflow(page, width);
    }
  });

  test('Alberta status is selected from its rendered ISO range', async ({ page }) => {
    await visitHome(page);

    const status = page.locator('[data-current-status]');
    const [asOf, starts, ends] = await Promise.all([
      status.getAttribute('data-as-of'),
      status.getAttribute('data-start-date'),
      status.getAttribute('data-end-date-exclusive'),
    ]);
    expect(asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(starts).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(starts <= asOf).toBe(true);
    if (ends) expect(asOf < ends).toBe(true);

    if (asOf < '2026-09-01') {
      await expect(status).toContainText('Incoming M.Sc. in Computing Science');
    } else {
      await expect(status).toContainText('M.Sc. in Computing Science');
      await expect(status).not.toContainText('Incoming');
    }
  });
});
