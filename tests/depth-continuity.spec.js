const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

test.describe('depth and continuity', () => {
  test('secondary indexes use shared secondary-record anatomy', async ({ page }) => {
    for (const path of ['/achievements/', '/news/', '/learning/']) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
      const records = page.locator('[data-secondary-record]');
      await expect(records.first()).toBeVisible();
      const first = records.first();
      await expect(first.locator('h3')).toBeVisible();
      await expect(first.locator('.secondary-record__meta')).toBeVisible();
      await expect(first.locator('.secondary-record__outcome')).toBeVisible();
    }
  });

  test('education dates are data-driven with datetime attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/education/`, { waitUntil: 'domcontentloaded' });
    const times = page.locator('.education-entry__meta time[datetime]');
    await expect(times).toHaveCount(7);
    await expect(times.first()).toHaveAttribute('datetime', '2026-09-01');
  });

  test('case-study summary strip appears on pilot engineering records', async ({ page }) => {
    await page.goto(`${BASE_URL}/showcase/projects/ctxhelm/`, { waitUntil: 'domcontentloaded' });
    const summary = page.locator('[data-case-study-summary]');
    await expect(summary).toBeVisible();
    await expect(summary.locator('dt', { hasText: 'Problem' })).toBeVisible();
    await expect(summary.locator('dt', { hasText: 'Constraints' })).toBeVisible();
    await expect(summary.locator('dt', { hasText: 'Approach' })).toBeVisible();
    await expect(summary.locator('dt', { hasText: 'Outcome' })).toBeVisible();
    await expect(summary.getByRole('link', { name: /ContextLedger/i })).toBeVisible();
  });

  test('research-detail summary exposes methods and related engineering', async ({ page }) => {
    await page.goto(`${BASE_URL}/research/ml-remote-code-execution/`, { waitUntil: 'domcontentloaded' });
    const summary = page.locator('[data-research-detail-summary]');
    await expect(summary).toBeVisible();
    await expect(summary.locator('dt', { hasText: 'Methods' })).toBeVisible();
    await expect(summary.getByRole('link', { name: /Publication record/i })).toBeVisible();
  });

  test('homepage selected evidence exposes related-evidence discovery links', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    const related = page.locator('[data-related-evidence]');
    await expect(related.first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Open-source contributions/i }).first()).toBeVisible();
  });

  test('reduced-motion disables ledger entrance animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE_URL}/achievements/`, { waitUntil: 'domcontentloaded' });
    const animation = await page.locator('[data-secondary-record]').first().evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        animationName: style.animationName,
        animationDuration: style.animationDuration,
      };
    });
    expect(animation.animationName === 'none' || animation.animationDuration === '0.01ms').toBeTruthy();
  });
});
