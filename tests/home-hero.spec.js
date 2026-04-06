const { test, expect } = require('@playwright/test');

test('home hero uses the revised bio copy and keeps the portrait anchored below the heading stack', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:4000', { waitUntil: 'networkidle' });

  const heroSection = page.locator('.homepage-classic .hero-section');
  const heroBio = page.locator('.homepage-classic .hero-bio').first();
  const heroPersonal = page.locator('.homepage-classic .hero-bio-personal');
  const heroImage = page.locator('.homepage-classic .hero-image');
  const heroName = page.locator('.homepage-classic .hero-name');

  await expect(heroBio).toContainText('Over the past 3 years at IQVIA');
  await expect(heroBio).toContainText('including 1 year focused on AI systems');
  await expect(heroBio).toContainText('University of Alberta');
  await expect(heroPersonal).toContainText('Outside work, I read a lot of history and economics');

  const [sectionBox, nameBox, bioBox, imageBox] = await Promise.all([
    heroSection.boundingBox(),
    heroName.boundingBox(),
    heroBio.boundingBox(),
    heroImage.boundingBox(),
  ]);

  expect(sectionBox).not.toBeNull();
  expect(nameBox).not.toBeNull();
  expect(bioBox).not.toBeNull();
  expect(imageBox).not.toBeNull();

  expect(
    imageBox.y,
    `Expected portrait top (${imageBox.y}) to sit below the heading stack (${nameBox.y + nameBox.height}).`,
  ).toBeGreaterThan(nameBox.y + nameBox.height);

  expect(
    Math.abs(imageBox.y - bioBox.y),
    `Expected portrait top (${imageBox.y}) to align closer to the bio block (${bioBox.y}).`,
  ).toBeLessThan(120);
});

test('about page includes the visited countries in the travel section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:4000/about', { waitUntil: 'networkidle' });

  const travelSection = page.locator('.about-travel');

  await expect(travelSection).toContainText('Bangladesh');
  await expect(travelSection).toContainText('India');
  await expect(travelSection).toContainText('Saudi Arabia');
  await expect(travelSection).toContainText('UAE');
  await expect(travelSection).toContainText('Sri Lanka');
  await expect(travelSection).toContainText('Maldives');
});
