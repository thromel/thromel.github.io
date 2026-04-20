const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const PAGE_CASES = {
  home: { path: '/', fallbackPath: '/' },
  contributions: { path: '/contributions', fallbackPath: '/contributions.html' },
};

const CONTRIBUTION_ITEMS = [
  {
    title: 'Stabilize proof surface states',
    html_url: 'https://github.com/langchain-ai/deepagents/pull/120',
    created_at: '2026-03-28T10:00:00Z',
    state: 'closed',
    number: 120,
    comments: 4,
    repository_url: 'https://api.github.com/repos/langchain-ai/deepagents',
    labels: [{ name: 'ui', color: '1f883d' }],
    pull_request: { merged_at: '2026-03-29T08:00:00Z' },
  },
  {
    title: 'Refine contribution grouping output',
    html_url: 'https://github.com/dotnet/efcore/pull/45000',
    created_at: '2026-03-27T14:30:00Z',
    state: 'open',
    number: 45000,
    comments: 1,
    repository_url: 'https://api.github.com/repos/dotnet/efcore',
    labels: [{ name: 'docs', color: '0366d6' }],
    pull_request: {},
  },
  {
    title: 'Closed without merge should stay hidden',
    html_url: 'https://github.com/microsoft/typescript-go/pull/77',
    created_at: '2026-03-20T09:00:00Z',
    state: 'closed',
    number: 77,
    comments: 0,
    repository_url: 'https://api.github.com/repos/microsoft/typescript-go',
    labels: [],
    pull_request: {},
  },
];

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

async function mockGitHubSearch(page, responseOptions) {
  await page.route('https://api.github.com/search/issues*', async (route) => {
    if (responseOptions.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, responseOptions.delayMs));
    }

    await route.fulfill({
      status: responseOptions.status,
      contentType: 'application/json',
      body: JSON.stringify(responseOptions.body),
    });
  });
}

test.describe('proof surfaces', () => {
  test('homepage proof surface renders merged pull request success state', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHubSearch(page, {
      status: 200,
      body: { total_count: 12, items: [{ id: 1 }] },
    });

    await gotoPage(page, PAGE_CASES.home);

    await expect(page.locator('#oss-summary')).toHaveAttribute('data-state', 'success');
    await expect(page.locator('#oss-summary-status')).toHaveAttribute('data-state', 'success');
    await expect(page.locator('#oss-summary .oss-badge')).toContainText('Open source activity');
    await expect(page.locator('#oss-summary .proof-state-label')).toHaveText('GitHub activity');
    await expect(page.locator('#oss-summary-text')).toHaveText('12 merged pull requests to open source projects.');
    await expect(page.locator('#oss-summary .proof-links a')).toHaveCount(6);
  });

  test('homepage proof surface keeps repository links visible when GitHub rate-limits', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHubSearch(page, {
      status: 403,
      body: { message: 'API rate limit exceeded for this IP address.' },
    });

    await gotoPage(page, PAGE_CASES.home);

    await expect(page.locator('#oss-summary')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#oss-summary-status')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#oss-summary-text')).toHaveText(
      'GitHub data is unavailable right now. Browse recent contribution targets instead.',
    );
    await expect(page.locator('#oss-summary .proof-links')).toBeVisible();
  });

  test('contributions surface shows loading first on mobile, then renders grouped success state', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await mockGitHubSearch(page, {
      status: 200,
      delayMs: 700,
      body: { total_count: 3, items: CONTRIBUTION_ITEMS },
    });

    await gotoPage(page, PAGE_CASES.contributions);

    await expect(page.locator('.contributions-proof-title')).toHaveText('Live contribution activity');
    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'loading');
    await expect(page.locator('#loading-state')).toBeVisible();
    await expect(page.locator('#loading-state .proof-state-label')).toHaveText('GitHub activity');
    await expect(page.locator('#loading-state .proof-state-text')).toHaveText('Fetching contributions from GitHub...');

    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'success');
    await expect(page.locator('#loading-state')).toBeHidden();
    await expect(page.locator('#contributions-section')).toBeVisible();
    await expect(page.locator('.contribution-item')).toHaveCount(2);
    await expect(page.locator('#merged-prs')).toHaveText('1');
    await expect(page.locator('#open-prs')).toHaveText('1');
    await expect(page.locator('#repos-contributed')).toHaveText('2');
  });

  test('contributions surface renders an empty state with zeroed stats', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHubSearch(page, {
      status: 200,
      body: { total_count: 0, items: [] },
    });

    await gotoPage(page, PAGE_CASES.contributions);

    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'empty');
    await expect(page.locator('#empty-state')).toBeVisible();
    await expect(page.locator('#contributions-section')).toBeHidden();
    await expect(page.locator('#merged-prs')).toHaveText('0');
    await expect(page.locator('#open-prs')).toHaveText('0');
    await expect(page.locator('#repos-contributed')).toHaveText('0');
  });

  test('contributions surface shows the rate-limit guidance message and preserves repository links', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHubSearch(page, {
      status: 403,
      body: { message: 'API rate limit exceeded for this IP address.' },
    });

    await gotoPage(page, PAGE_CASES.contributions);

    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#error-state')).toBeVisible();
    await expect(page.locator('#error-state-message')).toHaveText(
      'GitHub is rate-limited right now. Check back shortly or use the repository links below.',
    );
    await expect(page.locator('.proof-links a')).toHaveCount(6);
  });

  test('contributions surface shows the generic failure message when GitHub returns an unexpected error', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHubSearch(page, {
      status: 500,
      body: { message: 'Unexpected server error.' },
    });

    await gotoPage(page, PAGE_CASES.contributions);

    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#error-state')).toBeVisible();
    await expect(page.locator('#error-state-message')).toHaveText(
      'Unable to fetch contributions right now. Please try again later.',
    );
    await expect(page.locator('#contributions-section')).toBeHidden();
  });
});
