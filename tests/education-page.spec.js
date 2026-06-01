const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };
const schools = [
  'University of Alberta',
  'Bangladesh University of Engineering and Technology',
  'Rajshahi College',
  'Rajshahi Collegiate School',
];

async function expectNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${label} should not overflow horizontally.`).toBeLessThanOrEqual(dimensions.width + 1);
}

test('education page renders every school in the academic shell', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(`${BASE_URL}/education`, { waitUntil: 'domcontentloaded' });

  const educationSection = page.locator('.section-education.education-page');
  await expect(educationSection.locator('.education-entry')).toHaveCount(schools.length);
  await expect(page.locator('.academic-page-title')).toHaveText('Education');
  await expect(page.locator('#site-navigation')).not.toContainText('Education');
  await expect(page.locator('.academic-footer')).toContainText('Education');

  for (const school of schools) {
    await expect(educationSection).toContainText(school);
  }

  await expect(educationSection.locator('.education-coursework')).toContainText('Selected upper-division coursework');
});

test('education logos are contained in stable mobile cards', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto(`${BASE_URL}/education`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.section-education .education-entry')).toHaveCount(schools.length);
  await expectNoHorizontalOverflow(page, 'Education mobile');

  const logoMetrics = await page.locator('.education-entry').evaluateAll((entries) =>
    entries.map((entry) => {
      const wrap = entry.querySelector('.education-entry__logo-wrap');
      const logo = entry.querySelector('.education-entry__logo');
      const wrapRect = wrap.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const logoStyle = getComputedStyle(logo);

      return {
        objectFit: logoStyle.objectFit,
        wrapWidth: wrapRect.width,
        wrapHeight: wrapRect.height,
        logoWidth: logoRect.width,
        logoHeight: logoRect.height,
      };
    })
  );

  for (const metric of logoMetrics) {
    expect(metric.objectFit).toBe('contain');
    expect(metric.wrapWidth).toBeGreaterThanOrEqual(300);
    expect(metric.wrapHeight).toBeGreaterThanOrEqual(68);
    expect(metric.wrapHeight).toBeLessThanOrEqual(96);
    expect(metric.logoWidth).toBeLessThanOrEqual(metric.wrapWidth);
    expect(metric.logoHeight).toBeLessThanOrEqual(metric.wrapHeight);
  }
});
