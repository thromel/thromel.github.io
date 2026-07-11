const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

const ANCHORS = [
  { id: 'sregym', title: 'SREGym', directLink: 'https://github.com/SREGym/SREGym' },
  { id: 'ml-hosting-rce', title: 'Remote Code Execution', directLink: 'https://arxiv.org/abs/2601.14163' },
  { id: 'shift', title: 'Choice Can Be the Attack', directLink: '/research/reagent-plus-plus/' },
  { id: 'coding-agent-systems', title: 'Context, retrieval', directLink: '/showcase/projects/contextledger/' },
  { id: 'history-aware-vibe-coding', title: 'History-aware vibe coding', directLink: 'https://homepage.zhouyang.me/' },
  { id: 'verified-schema-generation', title: 'VeriSchema', directLink: '/research/multi-agent-db-schema/' },
];

async function visitResearch(page) {
  await page.goto(`${BASE_URL}/research`, { waitUntil: 'domcontentloaded' });
}

test.describe('research dossier contract', () => {
  test('research presents six connected lanes with questions, status, provenance, and direct artifacts', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visitResearch(page);

    await expect(page.locator('[data-research-dossier]')).toHaveCount(1);
    await expect(page.locator('[data-research-anchor]')).toHaveCount(6);

    for (const anchor of ANCHORS) {
      const record = page.locator(`[data-research-anchor="${anchor.id}"]`);
      await expect(record).toContainText(anchor.title);
      await expect(record.locator('[data-research-question]')).toBeVisible();
      await expect(record.locator('[data-research-status]')).toBeVisible();
      await expect(record.locator('[data-research-context]')).toBeVisible();
      await expect(record).toHaveAttribute('data-verified-on', /^\d{4}-\d{2}-\d{2}$/);
      await expect(record.locator(`a[href="${anchor.directLink}"]`)).toHaveCount(1);
    }
  });

  test('SHIFT keeps its non-public manuscript boundary explicit', async ({ page }) => {
    await visitResearch(page);

    const shift = page.locator('[data-research-anchor="shift"]');
    await expect(shift).toHaveAttribute('data-publicity', 'abstract-only');
    await expect(shift).toContainText(/manuscript not public/i);
  });

  test('research includes a supporting-systems ledger without mobile overflow', async ({ page }) => {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await visitResearch(page);
      await expect(page.locator('[data-research-systems]')).toHaveCount(1);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, `${width}px viewport`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  });
});
