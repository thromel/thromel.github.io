const { test, expect } = require('@playwright/test');

test.describe('Critical Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for theme initialization
    await page.waitForTimeout(1000);
  });

  test('Theme Toggle Button - Visibility and Functionality', async ({ page }) => {
    // Test theme toggle button exists and is visible
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Check initial position (bottom-right corner)
    const boundingBox = await themeToggle.boundingBox();
    expect(boundingBox.x).toBeGreaterThan(page.viewportSize().width - 100); // Right side
    expect(boundingBox.y).toBeGreaterThan(page.viewportSize().height - 150); // Bottom side
    
    // Get initial theme
    const initialThemeClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    // Click theme toggle
    await themeToggle.click();
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    // Verify theme changed
    const newThemeClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    expect(newThemeClass).not.toBe(initialThemeClass);
    expect(newThemeClass).toMatch(/(dark-theme|light-theme)/);
    
    // Test theme persistence by refreshing
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const persistedTheme = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    expect(persistedTheme).toBe(newThemeClass);
  });

  test('Search Button - Opens Modal Not Footer', async ({ page }) => {
    // Find search button in navbar
    const searchButton = page.locator('.search-button');
    await expect(searchButton).toBeVisible();
    
    // Verify search button is in navbar
    const navbar = page.locator('.navbar');
    await expect(navbar).toContainText('Search');
    
    // Click search button
    await searchButton.click();
    
    // Wait for modal to appear
    await page.waitForTimeout(300);
    
    // Check that search modal opened (not redirected to footer)
    const searchModal = page.locator('#search-modal');
    await expect(searchModal).toBeVisible();
    
    // Verify URL didn't change to footer
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('#footer');
    
    // Verify search input gets focus
    const searchInput = page.locator('#site-search-input');
    await expect(searchInput).toBeFocused();
    
    // Test search functionality
    await searchInput.fill('education');
    await page.waitForTimeout(500);
    
    // Should show search results
    const searchResults = page.locator('#site-search-results');
    await expect(searchResults).toBeVisible();
    
    // Close modal with Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    await expect(searchModal).not.toBeVisible();
  });

  test('Search Keyboard Shortcut - Ctrl+K', async ({ page }) => {
    // Test Ctrl+K shortcut (Cmd+K on Mac)
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+k`);
    
    // Wait for modal to appear
    await page.waitForTimeout(300);
    
    // Verify search modal opened
    const searchModal = page.locator('#search-modal');
    await expect(searchModal).toBeVisible();
    
    // Verify search input gets focus
    const searchInput = page.locator('#site-search-input');
    await expect(searchInput).toBeFocused();
  });

  test('Default Cursor Behavior', async ({ page }) => {
    // Verify default cursor is working properly
    const body = page.locator('body');
    const bodyStyles = await body.evaluate(el => getComputedStyle(el));
    expect(bodyStyles.cursor).toBe('auto');
    
    // Test interactive elements have proper cursor
    const button = page.locator('.btn').first();
    if (await button.isVisible()) {
      const buttonStyles = await button.evaluate(el => getComputedStyle(el));
      expect(buttonStyles.cursor).toBe('pointer');
    }
    
    // Test links have proper cursor
    const link = page.locator('a').first();
    if (await link.isVisible()) {
      const linkStyles = await link.evaluate(el => getComputedStyle(el));
      expect(linkStyles.cursor).toBe('pointer');
    }
    
    // Verify no custom cursor elements exist
    const customCursor = page.locator('.custom-cursor');
    await expect(customCursor).toHaveCount(0);
  });

  test('Skip Links - Accessibility Navigation', async ({ page }) => {
    // Test skip links by tabbing
    await page.keyboard.press('Tab');
    
    // Should focus on first skip link
    const firstSkipLink = page.locator('.skip-link').first();
    await expect(firstSkipLink).toBeFocused();
    await expect(firstSkipLink).toBeVisible();
    
    // Verify no "Skip to footer" link exists
    const footerSkipLink = page.locator('.skip-link').filter({ hasText: 'footer' });
    await expect(footerSkipLink).toHaveCount(0);
    
    // Test skip link functionality
    await firstSkipLink.click();
    
    // Should jump to main content
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('No JavaScript Errors', async ({ page }) => {
    const jsErrors = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    // Navigate and interact with page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Click theme toggle
    const themeToggle = page.locator('.theme-toggle');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Click search button
    const searchButton = page.locator('.search-button');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
    }
    
    // Check for critical JavaScript errors
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools') &&
      !error.includes('Extension')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});