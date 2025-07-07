const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
  test('Keyboard Navigation - Tab Order', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test skip links appear first
    await page.keyboard.press('Tab');
    
    const firstFocused = page.locator(':focus');
    const focusedText = await firstFocused.textContent();
    expect(focusedText).toContain('Skip to');
    
    // Continue tabbing through navigation
    const focusableElements = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      
      if (await focused.isVisible()) {
        const tagName = await focused.evaluate(el => el.tagName.toLowerCase());
        const role = await focused.getAttribute('role');
        const ariaLabel = await focused.getAttribute('aria-label');
        
        focusableElements.push({
          tagName,
          role,
          ariaLabel,
          text: await focused.textContent()
        });
      }
    }
    
    // Should have logical tab order: skip links -> navbar -> main content
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Check for proper focus indicators
    const lastFocused = page.locator(':focus');
    if (await lastFocused.isVisible()) {
      const outline = await lastFocused.evaluate(el => 
        getComputedStyle(el).outline
      );
      // Should have visible focus indicator
      expect(outline).not.toBe('none');
    }
  });

  test('ARIA Labels and Semantic HTML', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check navbar has proper ARIA
    const navbar = page.locator('.navbar');
    await expect(navbar).toHaveAttribute('role', 'navigation');
    
    const navbarAriaLabel = await navbar.getAttribute('aria-label');
    expect(navbarAriaLabel).toBeTruthy();
    
    // Check main content area
    const main = page.locator('main');
    await expect(main).toHaveAttribute('role', 'main');
    
    // Check search button has proper ARIA
    const searchButton = page.locator('.search-button');
    if (await searchButton.isVisible()) {
      const ariaLabel = await searchButton.getAttribute('aria-label');
      expect(ariaLabel).toContain('Search');
      
      const role = await searchButton.getAttribute('role');
      expect(role).toBe('menuitem');
    }
    
    // Check theme toggle accessibility
    const themeToggle = page.locator('.theme-toggle');
    if (await themeToggle.isVisible()) {
      const ariaLabel = await themeToggle.getAttribute('aria-label');
      expect(ariaLabel).toContain('Toggle');
      
      const title = await themeToggle.getAttribute('title');
      expect(title).toContain('mode');
    }
  });

  test('Heading Hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all headings
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(h => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent.trim(),
        visible: h.offsetParent !== null
      }));
    });
    
    // Should have at least one h1
    const h1Count = headings.filter(h => h.level === 1 && h.visible).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Check heading order is logical (no skipping levels)
    let previousLevel = 0;
    for (const heading of headings.filter(h => h.visible)) {
      if (previousLevel > 0) {
        // Shouldn't skip more than one level
        expect(heading.level - previousLevel).toBeLessThanOrEqual(1);
      }
      previousLevel = heading.level;
    }
  });

  test('Color Contrast - Accessibility Standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test both themes for contrast
    const themes = ['dark', 'light'];
    
    for (const theme of themes) {
      // Switch to theme
      const currentTheme = await page.evaluate(() => 
        document.documentElement.className
      );
      
      if (!currentTheme.includes(`${theme}-theme`)) {
        const themeToggle = page.locator('.theme-toggle');
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
      
      // Check text contrast on key elements
      const textElements = [
        { selector: 'h1, h2, h3', name: 'headings' },
        { selector: 'p', name: 'paragraphs' },
        { selector: '.nav-link', name: 'navigation' },
        { selector: '.btn', name: 'buttons' }
      ];
      
      for (const element of textElements) {
        const firstElement = page.locator(element.selector).first();
        
        if (await firstElement.isVisible()) {
          const styles = await firstElement.evaluate(el => {
            const computed = getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            };
          });
          
          // Basic contrast check - colors should not be the same
          expect(styles.color).not.toBe(styles.backgroundColor);
          
          // Font size should be readable
          const fontSize = parseInt(styles.fontSize);
          expect(fontSize).toBeGreaterThanOrEqual(14);
        }
      }
    }
  });

  test('Image Alt Text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      
      if (await image.isVisible()) {
        const alt = await image.getAttribute('alt');
        const ariaLabel = await image.getAttribute('aria-label');
        const role = await image.getAttribute('role');
        
        // Should have alt text or aria-label, unless decorative
        if (role !== 'presentation' && !ariaLabel) {
          expect(alt).toBeTruthy();
          expect(alt.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('Focus Management - Modal Interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test search modal focus management
    const searchButton = page.locator('.search-button');
    await searchButton.click();
    
    // Focus should move to search input
    const searchInput = page.locator('#site-search-input');
    await expect(searchInput).toBeFocused();
    
    // Tab should cycle within modal
    await page.keyboard.press('Tab');
    
    // Should stay within modal bounds
    const focusedElement = page.locator(':focus');
    const modalContainer = page.locator('#search-modal');
    
    // Check if focused element is within modal
    const isWithinModal = await page.evaluate(
      ({ modal, focused }) => modal.contains(focused),
      {
        modal: await modalContainer.elementHandle(),
        focused: await focusedElement.elementHandle()
      }
    );
    
    expect(isWithinModal).toBe(true);
    
    // Escape should close modal and return focus
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Modal should be closed
    await expect(modalContainer).not.toBeVisible();
    
    // Focus should return to search button
    await expect(searchButton).toBeFocused();
  });

  test('Screen Reader Announcements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for proper live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    
    // Should have some live regions for dynamic content
    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      }
    }
    
    // Check for hidden content properly marked
    const hiddenElements = page.locator('[aria-hidden="true"]');
    const hiddenCount = await hiddenElements.count();
    
    for (let i = 0; i < Math.min(5, hiddenCount); i++) {
      const hidden = hiddenElements.nth(i);
      
      // Hidden elements should not be focusable
      const isFocusable = await hidden.evaluate(el => {
        const tabIndex = el.tabIndex;
        const focusable = el.matches('a, button, input, select, textarea, [tabindex]');
        return focusable && tabIndex >= 0;
      });
      
      expect(isFocusable).toBe(false);
    }
  });

  test('Reduced Motion Preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that animations are reduced/disabled
    const animatedElements = page.locator('.card, .btn, .theme-toggle');
    const firstAnimated = animatedElements.first();
    
    if (await firstAnimated.isVisible()) {
      const transition = await firstAnimated.evaluate(el => 
        getComputedStyle(el).transitionDuration
      );
      
      // Transitions should be very short or disabled
      const duration = parseFloat(transition);
      expect(duration).toBeLessThan(0.1); // Less than 100ms
    }
    
    // Test theme toggle still works with reduced motion
    const themeToggle = page.locator('.theme-toggle');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(100);
      
      const themeClass = await page.evaluate(() => 
        document.documentElement.className
      );
      expect(themeClass).toMatch(/(dark-theme|light-theme)/);
    }
  });

  test('High Contrast Mode Support', async ({ page }) => {
    // Enable high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that elements are still visible and accessible
    const button = page.locator('.btn').first();
    if (await button.isVisible()) {
      const styles = await button.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          border: computed.border
        };
      });
      
      // Should have proper contrast
      expect(styles.color).not.toBe(styles.backgroundColor);
    }
    
    // Check theme toggle is still functional
    const themeToggle = page.locator('.theme-toggle');
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();
      
      // Should be clickable
      await themeToggle.click();
      await page.waitForTimeout(200);
    }
  });
});