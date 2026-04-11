const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
// Desktop viewport: 1280, 720
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
// Mobile viewport: 390, 844
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const PAGE_CASES = {
  home: { path: '/', fallbackPath: '/' },
  about: { path: '/about', fallbackPath: '/about.html' },
  learning: { path: '/learning', fallbackPath: '/learning.html' },
  contributions: { path: '/contributions', fallbackPath: '/contributions.html' },
};

async function gotoPage(page, pageCase) {
  const primaryResponse = await page.goto(BASE_URL + pageCase.path, { waitUntil: 'domcontentloaded' });

  if (pageCase.path === pageCase.fallbackPath) {
    return primaryResponse;
  }

  if (!primaryResponse || primaryResponse.status() === 404) {
    return page.goto(BASE_URL + pageCase.fallbackPath, { waitUntil: 'domcontentloaded' });
  }

  return primaryResponse;
}

async function installContributionsMock(page) {
  await page.route('https://api.github.com/search/issues*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            title: 'Improve documentation readability',
            html_url: 'https://github.com/open-source/example/pull/42',
            created_at: '2026-03-14T09:15:00Z',
            state: 'open',
            comments: 3,
            repository_url: 'https://api.github.com/repos/open-source/example',
            labels: [
              { name: 'documentation', color: '0366d6' },
              { name: 'good first review', color: '1f883d' },
            ],
            pull_request: {},
          },
        ],
      }),
    });
  });
}

async function getFontSize(locator) {
  return parseFloat(await locator.evaluate((element) => window.getComputedStyle(element).fontSize));
}

async function expectMinFontSize(locator, minimum, label) {
  const fontSize = await getFontSize(locator);
  expect(fontSize, `${label} should render at least ${minimum}px, but rendered at ${fontSize}px.`).toBeGreaterThanOrEqual(minimum);
}

async function expectLargerText(largerLocator, smallerLocator, largerLabel, smallerLabel) {
  const [largerSize, smallerSize] = await Promise.all([
    getFontSize(largerLocator),
    getFontSize(smallerLocator),
  ]);

  expect(
    largerSize,
    `${largerLabel} should render larger than ${smallerLabel}, but ${largerLabel} was ${largerSize}px and ${smallerLabel} was ${smallerSize}px.`,
  ).toBeGreaterThan(smallerSize);
}

test.describe('readability hierarchy', () => {
  test('desktop dense surfaces keep readable body text and clear hierarchy', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);

    await gotoPage(page, PAGE_CASES.home);
    const newsTitle = page.locator('#homepage-news .news-title').first();
    const newsDescription = page.locator('#homepage-news .news-description').first();
    const timelineDescription = page.locator('#homepage-publications .timeline-description, #homepage-research .timeline-description, #homepage-work .timeline-description').first();
    const timelineDate = page.locator('#homepage-publications .timeline-date, #homepage-research .timeline-date, #homepage-work .timeline-date').first();
    const focusCopy = page.locator('.current-focus-card p').first();

    await expect(newsTitle).toBeVisible();
    await expect(newsDescription).toBeVisible();
    await expect(timelineDescription).toBeVisible();
    await expect(timelineDate).toBeVisible();
    await expect(focusCopy).toBeVisible();
    await expectMinFontSize(newsDescription, 15, 'Homepage news description');
    await expectMinFontSize(timelineDescription, 15, 'Homepage timeline description');
    await expectMinFontSize(focusCopy, 15, 'Homepage current focus copy');
    await expectLargerText(newsTitle, newsDescription, 'Homepage news title', 'homepage news description');

    const [timelineDescriptionSize, timelineDateSize] = await Promise.all([
      getFontSize(timelineDescription),
      getFontSize(timelineDate),
    ]);
    expect(
      timelineDescriptionSize,
      `Homepage timeline body copy should render larger than timeline metadata, but body was ${timelineDescriptionSize}px and metadata was ${timelineDateSize}px.`,
    ).toBeGreaterThan(timelineDateSize);

    await gotoPage(page, PAGE_CASES.about);
    const aboutTitle = page.locator('.about-title');
    const aboutSubtitle = page.locator('.about-subtitle');
    const aboutBio = page.locator('.about-bio');

    await expect(aboutTitle).toBeVisible();
    await expect(aboutSubtitle).toBeVisible();
    await expect(aboutBio).toBeVisible();
    await expectMinFontSize(aboutBio, 16, 'About biography card');
    await expectLargerText(aboutTitle, aboutBio, 'About title', 'about biography copy');
    await expectLargerText(aboutTitle, aboutSubtitle, 'About title', 'about subtitle');

    await gotoPage(page, PAGE_CASES.learning);
    const learningIntro = page.locator('.learning-section-copy').first();
    const resourceTitle = page.locator('.resource-title').first();
    const resourceDescription = page.locator('.resource-description').first();
    const learningBadge = page.locator('.learning-list-badge').first();

    await expect(learningIntro).toBeVisible();
    await expect(resourceTitle).toBeVisible();
    await expect(resourceDescription).toBeVisible();
    await expect(learningBadge).toBeVisible();
    await expectMinFontSize(learningIntro, 15, 'Learning intro copy');
    await expectMinFontSize(resourceDescription, 15, 'Learning resource description');
    await expectLargerText(resourceTitle, resourceDescription, 'Learning resource title', 'learning resource description');
    await expectLargerText(page.locator('.learning-link-title').first(), learningBadge, 'Learning link title', 'learning list badge');

    await installContributionsMock(page);
    await gotoPage(page, PAGE_CASES.contributions);
    await expect(page.locator('.contribution-item')).toHaveCount(1);

    const contributionTitle = page.locator('.contribution-item .timeline-title').first();
    const contributionRepo = page.locator('.contribution-item .contribution-repo').first();
    const contributionMeta = page.locator('.contribution-item .contribution-meta').first();
    const statNumber = page.locator('.stat-number').first();
    const statLabel = page.locator('.stat-label').first();

    await expect(contributionTitle).toBeVisible();
    await expect(contributionRepo).toBeVisible();
    await expect(contributionMeta).toBeVisible();
    await expect(statLabel).toBeVisible();
    await expectMinFontSize(contributionMeta, 14, 'Contributions metadata row');
    await expectMinFontSize(statLabel, 14, 'Contributions stat label');
    await expectLargerText(contributionTitle, contributionMeta, 'Contribution title', 'contribution metadata');
    await expectLargerText(contributionRepo, contributionMeta, 'Contribution repository line', 'contribution metadata');
    await expectLargerText(statNumber, statLabel, 'Contribution stat number', 'contribution stat label');
  });

  test('mobile dense surfaces keep the same body floor and metadata stays subordinate', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await gotoPage(page, PAGE_CASES.home);
    const mobileTimelineTitle = page.locator('#homepage-publications .timeline-title, #homepage-research .timeline-title, #homepage-work .timeline-title').first();
    const mobileTimelineDescription = page.locator('#homepage-publications .timeline-description, #homepage-research .timeline-description, #homepage-work .timeline-description').first();
    const mobileNewsDescription = page.locator('#homepage-news .news-description').first();

    await expect(mobileTimelineTitle).toBeVisible();
    await expect(mobileTimelineDescription).toBeVisible();
    await expect(mobileNewsDescription).toBeVisible();
    await expectMinFontSize(mobileTimelineDescription, 15, 'Mobile homepage timeline description');
    await expectMinFontSize(mobileNewsDescription, 15, 'Mobile homepage news description');
    await expectLargerText(mobileTimelineTitle, mobileTimelineDescription, 'Mobile homepage timeline title', 'mobile homepage timeline description');

    await gotoPage(page, PAGE_CASES.about);
    const mobileAboutTitle = page.locator('.about-title');
    const mobileAboutBio = page.locator('.about-bio');

    await expect(mobileAboutTitle).toBeVisible();
    await expect(mobileAboutBio).toBeVisible();
    await expectMinFontSize(mobileAboutBio, 15, 'Mobile about biography card');
    await expectLargerText(mobileAboutTitle, mobileAboutBio, 'Mobile about title', 'mobile about biography copy');

    await gotoPage(page, PAGE_CASES.learning);
    const mobileResourceDescription = page.locator('.resource-description').first();
    const mobileResourceTitle = page.locator('.resource-title').first();
    const mobileLearningCopy = page.locator('.learning-section-copy').first();

    await expect(mobileResourceDescription).toBeVisible();
    await expect(mobileResourceTitle).toBeVisible();
    await expect(mobileLearningCopy).toBeVisible();
    await expectMinFontSize(mobileLearningCopy, 15, 'Mobile learning intro copy');
    await expectMinFontSize(mobileResourceDescription, 15, 'Mobile resource description');
    await expectLargerText(mobileResourceTitle, mobileResourceDescription, 'Mobile resource title', 'mobile resource description');

    await installContributionsMock(page);
    await gotoPage(page, PAGE_CASES.contributions);
    await expect(page.locator('.contribution-item')).toHaveCount(1);

    const mobileContributionRepo = page.locator('.contribution-item .contribution-repo').first();
    const mobileContributionMeta = page.locator('.contribution-item .contribution-meta').first();
    const mobileStatNumber = page.locator('.stat-number').first();
    const mobileStatLabel = page.locator('.stat-label').first();

    await expect(mobileContributionRepo).toBeVisible();
    await expect(mobileContributionMeta).toBeVisible();
    await expect(mobileStatNumber).toBeVisible();
    await expect(mobileStatLabel).toBeVisible();
    await expectMinFontSize(mobileContributionMeta, 14, 'Mobile contributions metadata row');
    await expectMinFontSize(mobileStatLabel, 14, 'Mobile contributions stat label');
    await expectLargerText(mobileContributionRepo, mobileContributionMeta, 'Mobile contribution repository line', 'mobile contribution metadata');
    await expectLargerText(mobileStatNumber, mobileStatLabel, 'Mobile contribution stat number', 'mobile contribution stat label');
  });
});
