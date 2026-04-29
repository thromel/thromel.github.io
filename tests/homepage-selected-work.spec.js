const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

const SELECTED_TITLES = [
  'An Empirical Study on Remote Code Execution in ML Model Hosting Ecosystems',
  'The Choice Can Be the Attack: Auditing Aligned Backdoors in LLM Agents',
  'VeriSchema: Multi-Agent Framework for Generating Relational DB Schema & ERD',
  'Patient-Centric Blockchain Framework for EHR Management',
];

const EXCLUDED_TITLES = [
  'Sentiment Analysis of Anonymous Crisis Reports in Bangladesh',
  
];

test('homepage keeps only selected research and publication work', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  const section = page.locator('#homepage-research-publications');

  await expect(section.locator('.academic-entry--selected')).toHaveCount(4);
  for (const title of SELECTED_TITLES) {
    await expect(section).toContainText(title);
  }
  for (const title of EXCLUDED_TITLES) {
    await expect(section).not.toContainText(title);
  }
  await expect(section).toContainText('See more research');
  await expect(section).toContainText('All publications');
});


test('homepage visual sections include available images and logos', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#homepage-research-publications .homepage-entry-media img')).toHaveCount(4);
  await expect(page.locator('#homepage-education .homepage-entry-media img')).toHaveCount(3);
  await expect(page.locator('#homepage-work .homepage-entry-media img')).toHaveCount(2);
  await expect(page.locator('#homepage-projects .homepage-entry-media img')).toHaveCount(4);
});
