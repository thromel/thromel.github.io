const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test('Page Load Performance', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstByte: navigation.responseStart - navigation.requestStart
      };
    });
    
    // DOM should be ready quickly
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
    
    // TTFB should be reasonable
    expect(performanceMetrics.firstByte).toBeLessThan(1000);
    
    console.log('Performance Metrics:', performanceMetrics);
  });

  test('CSS and JS Resource Loading', async ({ page }) => {
    const resourceLoadTimes = [];
    
    // Monitor resource loading
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.css') || url.includes('.js')) {
        resourceLoadTimes.push({
          url: url.split('/').pop(),
          status: response.status(),
          size: response.headers()['content-length'] || 'unknown'
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check critical CSS files loaded
    const criticalFiles = ['global.css', 'developer-theme.css', 'custom.css'];
    criticalFiles.forEach(file => {
      const loaded = resourceLoadTimes.find(resource => 
        resource.url.includes(file)
      );
      expect(loaded).toBeTruthy();
      expect(loaded.status).toBe(200);
    });
    
    console.log('Resource Load Times:', resourceLoadTimes);
  });

  test('Theme Switching Performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const themeToggle = page.locator('.theme-toggle');
    
    // Measure theme switch time
    const startTime = Date.now();
    await themeToggle.click();
    
    // Wait for theme transition to complete
    await page.waitForTimeout(500);
    
    const switchTime = Date.now() - startTime;
    
    // Theme switch should be quick
    expect(switchTime).toBeLessThan(1000);
    
    // Test multiple rapid switches
    for (let i = 0; i < 3; i++) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }
    
    // Page should remain responsive
    const finalTheme = await page.evaluate(() => 
      document.documentElement.className
    );
    expect(finalTheme).toMatch(/(dark-theme|light-theme)/);
  });

  test('Search Modal Performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchButton = page.locator('.search-button');
    
    // Measure search modal open time
    const startTime = Date.now();
    await searchButton.click();
    
    // Wait for modal to be visible
    const searchModal = page.locator('#search-modal');
    await expect(searchModal).toBeVisible();
    
    const openTime = Date.now() - startTime;
    
    // Modal should open quickly
    expect(openTime).toBeLessThan(500);
    
    // Test search performance
    const searchInput = page.locator('#site-search-input');
    await searchInput.fill('test search query');
    
    // Search should respond quickly
    await page.waitForTimeout(300);
    const searchResults = page.locator('#site-search-results');
    await expect(searchResults).toBeVisible();
  });

  test('Animation Performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test hover animations don't cause lag
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      // Rapidly hover over multiple cards
      for (let i = 0; i < Math.min(5, cardCount); i++) {
        await cards.nth(i).hover();
        await page.waitForTimeout(50);
      }
      
      // Page should remain responsive
      const themeToggle = page.locator('.theme-toggle');
      await expect(themeToggle).toBeVisible();
    }
    
    // Test scroll performance
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(50);
    }
    
    // Scroll indicator should update smoothly
    const scrollIndicator = page.locator('.scroll-indicator-progress');
    if (await scrollIndicator.isVisible()) {
      const width = await scrollIndicator.evaluate(el => 
        getComputedStyle(el).width
      );
      expect(width).not.toBe('0px');
    }
  });

  test('Memory Usage - No Leaks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Perform actions that could cause memory leaks
    const themeToggle = page.locator('.theme-toggle');
    const searchButton = page.locator('.search-button');
    
    // Multiple theme switches
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();
      await page.waitForTimeout(200);
    }
    
    // Multiple search modal open/close
    for (let i = 0; i < 3; i++) {
      await searchButton.click();
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
    
    // Check for excessive console warnings about memory
    const warnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && 
          (msg.text().includes('memory') || msg.text().includes('leak'))) {
        warnings.push(msg.text());
      }
    });
    
    // Reload to trigger any cleanup
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should not have memory-related warnings
    expect(warnings.length).toBe(0);
  });

  test('Image Loading Performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for lazy loading
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first image loads quickly
      const firstImage = images.first();
      await expect(firstImage).toBeVisible({ timeout: 3000 });
      
      // Check for loading attribute
      const loadingAttr = await firstImage.getAttribute('loading');
      // Should have lazy loading on appropriate images
      if (loadingAttr) {
        expect(['lazy', 'eager']).toContain(loadingAttr);
      }
      
      // Check images have proper dimensions to prevent layout shift
      const hasWidth = await firstImage.getAttribute('width');
      const hasHeight = await firstImage.getAttribute('height');
      
      if (hasWidth && hasHeight) {
        expect(parseInt(hasWidth)).toBeGreaterThan(0);
        expect(parseInt(hasHeight)).toBeGreaterThan(0);
      }
    }
  });

  test('Critical CSS Inline Loading', async ({ page }) => {
    await page.goto('/');
    
    // Check for inline critical CSS
    const inlineStyles = page.locator('style');
    const styleCount = await inlineStyles.count();
    
    expect(styleCount).toBeGreaterThan(0);
    
    // Check critical styles are defined
    const criticalCSS = await page.evaluate(() => {
      const styles = Array.from(document.querySelectorAll('style'));
      return styles.some(style => 
        style.textContent.includes('.navbar') ||
        style.textContent.includes('.theme-toggle') ||
        style.textContent.includes('--accent-primary')
      );
    });
    
    expect(criticalCSS).toBe(true);
  });
});