# Automated Testing Suite for tanzimhromel.com

This automated testing suite uses **Playwright** to test the live website functionality across multiple browsers and devices.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Internet connection (tests run against live site)

### Installation
```bash
cd automated-tests
npm install
npx playwright install
```

### Run Tests
```bash
# Run all tests
npm test

# Run with visible browser (headed mode)
npm run test:headed

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:safari

# Run mobile tests
npm run test:mobile

# Debug mode
npm run test:debug
```

## 📋 Test Suites

### 1. Critical Functionality (`critical-functionality.spec.js`)
Tests the core features that must work:
- ✅ **Theme Toggle** - Visibility, functionality, persistence
- ✅ **Search Button** - Opens modal (not footer redirect)
- ✅ **Custom Cursor** - Desktop tracking and interactions
- ✅ **Skip Links** - Accessibility navigation
- ✅ **No JavaScript Errors** - Console error monitoring

### 2. Responsive Design (`responsive-design.spec.js`)
Tests across different screen sizes:
- 📱 **Mobile Navigation** - Hamburger menu functionality
- 🔘 **Theme Toggle Mobile** - Position and functionality
- 🔍 **Mobile Search** - Modal sizing and usability
- 📊 **Tablet Layout** - 768px to 1024px breakpoint
- 🖥️ **Desktop Layout** - Full feature set
- 👆 **Touch Interactions** - Tap targets and highlights

### 3. Performance (`performance.spec.js`)
Tests loading speed and responsiveness:
- ⚡ **Page Load Performance** - Under 5 seconds
- 📦 **Resource Loading** - CSS/JS file loading
- 🎨 **Theme Switching Performance** - Under 1 second
- 🔍 **Search Modal Performance** - Under 500ms open time
- 🎬 **Animation Performance** - 60fps smooth animations
- 💾 **Memory Usage** - No memory leaks

### 4. Accessibility (`accessibility.spec.js`)
Tests WCAG 2.1 AA compliance:
- ⌨️ **Keyboard Navigation** - Tab order and focus
- 🏷️ **ARIA Labels** - Semantic HTML structure
- 📰 **Heading Hierarchy** - Proper h1-h6 structure
- 🎨 **Color Contrast** - Both dark and light themes
- 🖼️ **Image Alt Text** - All images have descriptions
- 🎯 **Focus Management** - Modal interactions
- 📢 **Screen Reader Support** - Live regions and announcements
- 🎭 **Reduced Motion** - Respects user preferences
- 🔳 **High Contrast Mode** - System accessibility settings

## 🎯 Test Execution

### Run Specific Test Suites
```bash
# Critical functionality only
npx playwright test critical-functionality

# Performance tests only
npx playwright test performance

# Accessibility tests only
npx playwright test accessibility

# Responsive design only
npx playwright test responsive-design
```

### Run Tests on Specific Browsers
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only  
npx playwright test --project=firefox

# Safari only (Mac)
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project=mobile-chrome

# All browsers
npx playwright test
```

### Debug Failed Tests
```bash
# Run in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test critical-functionality --debug

# Generate test report
npm run test:report
```

## 📊 Test Results

### Pass Criteria
All tests should pass for production deployment:
- ✅ Theme toggle works on all browsers
- ✅ Search opens modal (not footer)
- ✅ Custom cursor tracks properly
- ✅ Mobile navigation functions
- ✅ Page loads under 5 seconds
- ✅ No accessibility violations
- ✅ No JavaScript console errors

### Test Reports
After running tests:
```bash
# View HTML report
npm run test:report

# Check JSON results
cat test-results.json
```

## 🔧 Configuration

### Browser Settings (`playwright.config.js`)
- **Base URL**: https://tanzimhromel.com
- **Timeout**: 10 seconds per action
- **Retries**: 1 retry on failure
- **Screenshots**: On failure only
- **Video**: On failure only
- **Trace**: On first retry

### Supported Browsers
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop)
- ✅ Safari (Desktop & Mobile)
- ✅ Edge (Desktop)

### Viewports Tested
- 📱 **Mobile**: 375x667 (iPhone)
- 📱 **Mobile**: 360x800 (Android)
- 📱 **Tablet**: 768x1024 (iPad)
- 🖥️ **Desktop**: 1920x1080 (Full HD)

## 🚨 Troubleshooting

### Common Issues

**Tests failing locally:**
```bash
# Clear browser cache
npx playwright install --force

# Update dependencies
npm update
```

**Theme toggle not found:**
- Check if button is created by JavaScript
- Verify CSS z-index hierarchy
- Check viewport size (mobile vs desktop)

**Search redirects to footer:**
- Verify skip links are properly hidden
- Check event handler attachment
- Test JavaScript console for errors

**Custom cursor not working:**
- Only works on desktop (width > 768px)
- Check if CSS files loaded properly
- Verify cursor elements are created

### Debug Commands
```bash
# Run single test with console output
npx playwright test critical-functionality --reporter=line

# Run with verbose logging
DEBUG=pw:api npx playwright test

# Generate trace file
npx playwright test --trace=on
```

## 📈 Continuous Integration

### GitHub Actions Integration
Add to `.github/workflows/test.yml`:
```yaml
name: Automated Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd automated-tests && npm install
      - run: cd automated-tests && npx playwright install
      - run: cd automated-tests && npm test
```

### Test Frequency
- **Before deployment**: Run full suite
- **Daily**: Run critical functionality tests
- **Weekly**: Run complete accessibility audit
- **On major changes**: Run full cross-browser suite

## 📞 Support

### Getting Help
1. **Check test results**: `npm run test:report`
2. **Review screenshots**: `test-results/` folder
3. **Check console logs**: Enable debug mode
4. **Verify live site**: Manual testing at tanzimhromel.com

### Test Maintenance
- Update selectors if UI changes
- Add new tests for new features
- Adjust timeouts if needed
- Keep dependencies updated

---

**Last Updated**: January 2025  
**Playwright Version**: 1.40.0  
**Node.js**: 16+ required  
**Target Site**: https://tanzimhromel.com