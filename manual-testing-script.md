# Manual Browser Testing Script
**Website:** https://tanzimhromel.com  
**Date:** January 2025  
**Purpose:** Verify Phase 4 UI/UX improvements and bug fixes

## Pre-Testing Setup
- [ ] Open browser developer tools (F12)
- [ ] Set viewport to desktop (1920x1080) initially
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Disable browser extensions that might interfere
- [ ] Check console for any JavaScript errors

---

## 🎯 **CRITICAL FUNCTIONALITY TESTS**

### 1. Theme Toggle Button
**Expected:** Circular blue button in bottom-right corner

- [ ] **Visibility Test**
  - Navigate to https://tanzimhromel.com
  - Look for circular button in bottom-right (90px from bottom, 30px from right)
  - Button should show sun ☀️ icon (default dark theme)
  
- [ ] **Click Test**
  - Click the theme toggle button
  - Page should switch to light theme
  - Button icon should change to moon 🌙
  - All colors should transition smoothly
  
- [ ] **Theme Persistence**
  - Refresh the page
  - Theme should remain on the setting you chose
  - Button icon should match the current theme

**❌ FAIL CRITERIA:** Button not visible, no theme change, icon doesn't update

### 2. Search Button Functionality
**Expected:** Search button opens modal, not redirect to footer

- [ ] **Button Location**
  - Find search button in navbar (magnifying glass icon 🔍)
  - Should be positioned on the right side of navigation
  
- [ ] **Click Test**
  - Click the search button
  - Should open search modal overlay (NOT redirect to footer)
  - Search input field should appear and get focus
  - Background should dim/overlay
  
- [ ] **Keyboard Shortcut**
  - Press Ctrl+K (Cmd+K on Mac)
  - Should open search modal
  - Press Escape to close modal
  
- [ ] **Search Functionality**
  - Type a search term (e.g., "education", "research")
  - Should show search results
  - Click a result to navigate

**❌ FAIL CRITERIA:** Redirects to footer, modal doesn't open, search doesn't work

### 3. Custom Cursor (Desktop Only)
**Expected:** Custom cursor follows mouse on desktop screens

- [ ] **Cursor Visibility**
  - On desktop (screen width > 768px)
  - Move mouse around the page
  - Should see custom blue dot cursor with circular follower
  - Default cursor should be hidden
  
- [ ] **Cursor Tracking**
  - Move mouse to different areas of page
  - Scroll up and down while moving mouse
  - Custom cursor should follow smoothly without lag
  
- [ ] **Interactive Elements**
  - Hover over buttons, links, cards
  - Cursor should change size/color on hover
  - Should provide visual feedback

**❌ FAIL CRITERIA:** No custom cursor, cursor doesn't follow, lag/glitches

---

## 🔍 **DETAILED COMPONENT TESTS**

### 4. Navbar Functionality
- [ ] **Fixed Positioning**
  - Navbar stays at top when scrolling
  - No overlapping elements on navbar
  - Brand shows "Tanzim Hossain Romel" with subtitle "Software Engineer & Researcher"
  
- [ ] **Navigation Links**
  - Test all dropdown menus work
  - Home dropdown shows: Overview, Education, Experience, Research, Projects, Skills
  - All links navigate correctly
  
- [ ] **Mobile Menu**
  - Resize to mobile (< 768px)
  - Hamburger menu appears
  - Menu toggles open/closed correctly
  - All links work in mobile menu

### 5. Skip Links (Accessibility)
- [ ] **Skip Link Access**
  - Press Tab key when page loads
  - Should see "Skip to main content" link appear
  - Press Tab again for "Skip to navigation"
  - No "Skip to footer" link should appear
  
- [ ] **Skip Link Function**
  - Click "Skip to main content" - should jump to main content
  - Click "Skip to navigation" - should focus on navbar

### 6. Scroll Behavior
- [ ] **Scroll Indicator**
  - Thin progress bar at very top of page
  - Should fill as you scroll down the page
  - Should be subtle (30% opacity)
  
- [ ] **Back to Top Button**
  - Scroll down the page
  - Circular arrow button should appear bottom-right
  - Click it to scroll back to top smoothly
  
- [ ] **Smooth Scrolling**
  - Click any anchor link (e.g., #education, #experience)
  - Should scroll smoothly to section (not jump)

---

## 📱 **RESPONSIVE DESIGN TESTS**

### 7. Mobile Testing (< 768px)
- [ ] **Navbar Adjustments**
  - Hamburger menu appears
  - Brand text is readable and not truncated
  - Search button still accessible
  
- [ ] **Theme Toggle**
  - Button remains visible and clickable
  - Positioned correctly on mobile
  
- [ ] **Touch Interactions**
  - All buttons respond to touch
  - No lag or double-tap issues
  - Touch targets are adequately sized

### 8. Tablet Testing (768px - 1024px)
- [ ] **Layout Adaptation**
  - Content layouts adjust appropriately
  - Images scale correctly
  - Text remains readable
  
- [ ] **Navigation**
  - Full navbar visible (not hamburger)
  - All functionality works

### 9. Desktop Testing (> 1024px)
- [ ] **Full Feature Set**
  - Custom cursor active
  - All animations smooth
  - Hover effects work
  - Full navbar with dropdowns

---

## ⚡ **PERFORMANCE TESTS**

### 10. Page Load Performance
- [ ] **Initial Load**
  - Page loads within 3 seconds
  - No Flash of Unstyled Content (FOUC)
  - Critical styles load immediately
  
- [ ] **Core Web Vitals**
  - Open DevTools > Lighthouse
  - Run Performance audit
  - Check for good LCP, FID, CLS scores
  
- [ ] **Animation Performance**
  - Smooth 60fps animations
  - No stuttering during scroll
  - Hover effects are responsive

### 11. Theme Switching Performance
- [ ] **Transition Speed**
  - Theme changes happen within 0.5 seconds
  - Smooth color transitions
  - No flashing or jarring changes
  
- [ ] **Memory Usage**
  - Check DevTools > Memory
  - No significant memory leaks after multiple theme switches

---

## 🎨 **VISUAL DESIGN TESTS**

### 12. Liquid Glass Design
- [ ] **Card Components**
  - Semi-transparent backgrounds
  - Subtle shadows and borders
  - Hover effects with slight elevation
  
- [ ] **Color Consistency**
  - Dark theme: Deep blues with cyan accents
  - Light theme: Clean whites with blue accents
  - All text meets accessibility contrast standards
  
- [ ] **Typography**
  - Proper font loading (Plus Jakarta Sans)
  - Readable text hierarchy
  - Proper spacing and line heights

### 13. Micro-Interactions
- [ ] **Button Interactions**
  - Magnetic effects on hover
  - Ripple effects on click
  - Smooth transform animations
  
- [ ] **Card Animations**
  - Cards lift slightly on hover
  - Smooth transitions
  - No performance issues

---

## 🔧 **ERROR HANDLING TESTS**

### 14. JavaScript Error Handling
- [ ] **Console Check**
  - Open DevTools Console
  - No critical JavaScript errors
  - Only expected debug messages
  
- [ ] **Failed Loads**
  - Temporarily disable JavaScript
  - Page should still be functional (graceful degradation)
  - Re-enable JavaScript

### 15. Network Issues
- [ ] **Slow Connection**
  - Throttle network in DevTools (Slow 3G)
  - Page should load progressively
  - Critical content appears first
  
- [ ] **Offline Mode**
  - Enable offline mode in DevTools
  - Should show offline page
  - Service worker should cache content

---

## 📊 **ACCESSIBILITY TESTS**

### 16. Keyboard Navigation
- [ ] **Tab Order**
  - Tab through all interactive elements
  - Focus indicators are visible
  - Logical tab order maintained
  
- [ ] **Keyboard Shortcuts**
  - Ctrl+K opens search
  - Escape closes modals
  - Arrow keys work in dropdowns

### 17. Screen Reader Testing
- [ ] **Semantic HTML**
  - Proper heading hierarchy (h1, h2, h3)
  - ARIA labels on interactive elements
  - Alt text on images
  
- [ ] **Announcements**
  - Theme changes are announced
  - Modal open/close is announced
  - Navigation changes are clear

---

## 🧪 **BROWSER COMPATIBILITY**

### 18. Cross-Browser Testing
Test in these browsers:

- [ ] **Chrome** (latest)
  - All functionality works
  - No visual glitches
  
- [ ] **Firefox** (latest)
  - CSS animations work
  - JavaScript functionality intact
  
- [ ] **Safari** (if available)
  - WebKit-specific features work
  - No iOS-specific issues
  
- [ ] **Edge** (latest)
  - Microsoft-specific behaviors
  - All features functional

---

## 📝 **TEST RESULTS TEMPLATE**

### Pass/Fail Summary
```
✅ Theme Toggle: PASS/FAIL
✅ Search Button: PASS/FAIL  
✅ Custom Cursor: PASS/FAIL
✅ Mobile Responsive: PASS/FAIL
✅ Performance: PASS/FAIL
✅ Accessibility: PASS/FAIL
```

### Issues Found
```
1. [Issue Description]
   - Browser: [Chrome/Firefox/Safari/Edge]
   - Device: [Desktop/Mobile/Tablet]
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

2. [Next Issue...]
```

### Performance Metrics
```
Lighthouse Scores:
- Performance: __/100
- Accessibility: __/100
- Best Practices: __/100
- SEO: __/100

Load Times:
- First Contentful Paint: __ms
- Largest Contentful Paint: __ms
- Time to Interactive: __ms
```

---

## 🚀 **FINAL CHECKLIST**

Before completing testing:

- [ ] All critical functionality works
- [ ] No JavaScript errors in console
- [ ] Performance is acceptable (< 3s load)
- [ ] Mobile experience is smooth
- [ ] Theme switching works properly
- [ ] Search functionality is operational
- [ ] Accessibility features function
- [ ] Visual design matches expectations

---

## 📞 **SUPPORT INFORMATION**

If issues are found:
1. **Document the issue** using the template above
2. **Take screenshots** of any visual problems  
3. **Record console errors** if JavaScript issues occur
4. **Note browser and device information**
5. **Test in multiple browsers** to confirm scope

**Contact:** This testing helps ensure the Phase 4 improvements are working correctly in production.

---

*Last Updated: January 2025*  
*Version: 1.0*  
*Compatible with: Chrome, Firefox, Safari, Edge*