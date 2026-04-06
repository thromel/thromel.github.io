const { test, expect } = require('@playwright/test');

test('home education summary links to a dedicated education page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:4000', { waitUntil: 'networkidle' });

  const educationSection = page.locator('.section-education');
  await expect(educationSection.locator('.timeline-item')).toHaveCount(2);

  const fullEducationLink = educationSection.getByRole('link', { name: 'View Full Education →' });
  await expect(fullEducationLink).toHaveAttribute('href', '/education');

  await fullEducationLink.click();
  await page.waitForURL('**/education');

  const educationPageSection = page.locator('.education-page');
  await expect(educationPageSection.locator('.timeline-item')).toHaveCount(4);
  await expect(educationPageSection.locator('.section-title')).toContainText('Education');
  await expect(educationPageSection.locator('.section-subtitle')).toContainText('Academic background');
  await expect(page.locator('.nav-links .nav-link').filter({ hasText: 'Education' })).toHaveCount(0);
});
