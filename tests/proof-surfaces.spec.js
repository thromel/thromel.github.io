const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const searchResponse = (items) => ({ total_count: items.length, items });
const contributionItem = {
  html_url: 'https://github.com/example/repo/pull/1',
  title: 'Improve academic theme',
  state: 'closed',
  pull_request: { merged_at: '2026-04-01T00:00:00Z' },
  repository_url: 'https://api.github.com/repos/example/repo',
  created_at: '2026-03-28T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  labels: [{ name: 'ui' }],
  number: 1,
  user: { login: 'thromel' },
};

async function mockGitHub(page, status, body) {
  await page.route('https://api.github.com/search/issues*', async (route) => {
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test.describe('proof surfaces', () => {
  test('homepage OSS summary keeps academic proof surface', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#oss-summary.proof-surface')).toHaveCount(1);
    await expect(page.locator('#oss-summary')).toContainText('Open source activity');
  });

  test('contributions surface renders grouped success state', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await mockGitHub(page, 200, searchResponse([contributionItem]));
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.contributions-proof-title')).toHaveText('Live contribution activity');
    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'success');
    await expect(page.locator('#contributions-section')).toBeVisible();
    await expect(page.locator('.contribution-item')).toContainText('Improve academic theme');
  });

  test('contributions surface renders empty state', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHub(page, 200, searchResponse([]));
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'empty');
    await expect(page.locator('#empty-state .proof-state-text')).toHaveText('No external contributions found yet.');
  });

  test('contributions surface shows rate-limit guidance', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHub(page, 403, { message: 'API rate limit exceeded' });
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#error-state-message')).toContainText('rate-limited');
    await expect(page.locator('.proof-links')).toContainText('RefactoringMiner');
  });

  test('contributions surface shows generic failure', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await mockGitHub(page, 500, { message: 'server error' });
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#contributions-proof')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#error-state-message')).toHaveText('Unable to fetch contributions right now. Please try again later.');
  });
});
