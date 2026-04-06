const { test, expect } = require('@playwright/test');

const schools = [
  'University of Alberta',
  'Bangladesh University of Engineering and Technology',
  'Rajshahi College',
  'Rajshahi Collegiate School',
];

test('home education summary links to a dedicated education page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:4000', { waitUntil: 'networkidle' });

  const educationSection = page.locator('.section-education');
  await expect(educationSection.locator('.timeline-item')).toHaveCount(2);

  const fullEducationLink = educationSection.getByRole('link', { name: 'View Full Education →' });
  await expect(fullEducationLink).toHaveAttribute('href', '/education');

  await fullEducationLink.click();
  await page.waitForURL('**/education');

  await expect(page.locator('.section-education .section-title')).toContainText('Education');
  await expect(page.locator('.section-subtitle')).toContainText('Academic background');
  await expect(page.locator('.nav-links .nav-link').filter({ hasText: 'Education' })).toHaveCount(0);
});

test('education page renders every education entry and richer academic details', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:4000/education', { waitUntil: 'networkidle' });

  const educationSection = page.locator('.section-education');
  await expect(educationSection.locator('.timeline-item')).toHaveCount(4);

  for (const school of schools) {
    await expect(educationSection).toContainText(school);
  }

  await expect(educationSection.locator('.education-status-badge')).toContainText('Incoming');
  await expect(educationSection.locator('.education-coursework')).toContainText('Selected upper-division coursework');
});
