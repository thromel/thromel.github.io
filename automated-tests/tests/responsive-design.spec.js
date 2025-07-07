const { test, expect } = require('@playwright/test');

test.describe('Responsive Design Tests', () => {
  test('Mobile Navigation - Hamburger Menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check hamburger menu is visible
    const hamburgerToggle = page.locator('.navbar-toggler');
    await expect(hamburgerToggle).toBeVisible();
    
    // Check mobile menu is initially collapsed
    const navbarCollapse = page.locator('#navbarResponsive');
    await expect(navbarCollapse).not.toHaveClass(/show/);
    
    // Click hamburger menu
    await hamburgerToggle.click();
    await page.waitForTimeout(300);
    
    // Menu should expand
    await expect(navbarCollapse).toHaveClass(/show/);
    
    // Test navigation links work
    const homeLink = page.locator('.nav-link').filter({ hasText: 'Home' });
    await expect(homeLink).toBeVisible();
    
    // Click outside to close menu
    await page.click('body', { position: { x: 50, y: 300 } });
    await page.waitForTimeout(300);
    
    // Menu should collapse
    await expect(navbarCollapse).not.toHaveClass(/show/);
  });

  test('Mobile Theme Toggle - Visibility and Position', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Theme toggle should still be visible on mobile
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Check position is still bottom-right
    const boundingBox = await themeToggle.boundingBox();
    expect(boundingBox.x).toBeGreaterThan(300); // Right side on mobile
    expect(boundingBox.y).toBeGreaterThan(500); // Bottom side on mobile
    
    // Test functionality on mobile
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Should still work
    const themeClass = await page.evaluate(() => 
      document.documentElement.className
    );
    expect(themeClass).toMatch(/(dark-theme|light-theme)/);
  });

  test('Mobile Search Functionality', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Search button should be accessible in mobile menu
    const hamburgerToggle = page.locator('.navbar-toggler');
    await hamburgerToggle.click();
    await page.waitForTimeout(300);
    
    const searchButton = page.locator('.search-button');
    await expect(searchButton).toBeVisible();
    
    // Test search on mobile
    await searchButton.click();
    await page.waitForTimeout(300);
    
    const searchModal = page.locator('#search-modal');
    await expect(searchModal).toBeVisible();
    
    // Modal should be properly sized for mobile
    const modalBox = await searchModal.boundingBox();
    expect(modalBox.width).toBeLessThanOrEqual(375);
    
    await page.keyboard.press('Escape');
  });

  test('Tablet Layout - 768px to 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should show full navbar (no hamburger)
    const hamburgerToggle = page.locator('.navbar-toggler');
    await expect(hamburgerToggle).not.toBeVisible();
    
    // Navigation should be horizontal
    const navbar = page.locator('.navbar-nav');
    await expect(navbar).toBeVisible();
    
    // Theme toggle should be positioned correctly
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    const boundingBox = await themeToggle.boundingBox();
    expect(boundingBox.x).toBeGreaterThan(700); // Right side on tablet
  });

  test('Desktop Layout - Above 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Full desktop experience
    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();
    
    // Should have custom cursor on desktop
    const cursor = page.locator('.custom-cursor');
    await expect(cursor).toBeAttached();
    
    // Test hover effects work on desktop
    const button = page.locator('.btn').first();
    if (await button.isVisible()) {
      await button.hover();
      await page.waitForTimeout(200);
      
      // Should have hover transform
      const transform = await button.evaluate(el => 
        getComputedStyle(el).transform
      );
      // Transform should be applied (not 'none' or 'matrix(1, 0, 0, 1, 0, 0)')
      expect(transform).not.toBe('none');
    }
  });

  test('Touch Interactions - Mobile Optimized', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test touch targets are adequate size (minimum 44px)
    const themeToggle = page.locator('.theme-toggle');
    const toggleBox = await themeToggle.boundingBox();
    expect(toggleBox.width).toBeGreaterThanOrEqual(44);
    expect(toggleBox.height).toBeGreaterThanOrEqual(44);
    
    // Test tap highlight is disabled
    const body = page.locator('body');
    const tapHighlight = await body.evaluate(el => 
      getComputedStyle(el).webkitTapHighlightColor
    );
    expect(tapHighlight).toBe('rgba(0, 0, 0, 0)');
  });

  test('Viewport Meta Tag - Proper Mobile Scaling', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag exists and is correct
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute(
      'content', 
      'width=device-width, initial-scale=1, shrink-to-fit=no'
    );
  });

  test('Text Readability - Different Screen Sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check main heading is readable
      const mainHeading = page.locator('h1, h2').first();
      if (await mainHeading.isVisible()) {
        const fontSize = await mainHeading.evaluate(el => 
          parseInt(getComputedStyle(el).fontSize)
        );
        
        // Font should be at least 16px on mobile, larger on desktop
        if (viewport.name === 'mobile') {
          expect(fontSize).toBeGreaterThanOrEqual(16);
        } else {
          expect(fontSize).toBeGreaterThanOrEqual(18);
        }
      }
      
      // Check line height for readability
      const paragraph = page.locator('p').first();
      if (await paragraph.isVisible()) {
        const lineHeight = await paragraph.evaluate(el => 
          getComputedStyle(el).lineHeight
        );
        expect(parseFloat(lineHeight)).toBeGreaterThan(1.2);
      }
    }
  });
});