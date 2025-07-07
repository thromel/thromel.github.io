// Browser Console Testing Script for tanzimhromel.com
// Copy and paste this into browser console (F12) to run automated checks

console.log('🧪 Starting automated browser tests for tanzimhromel.com...\n');

// Test Results Storage
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

// Helper function to log test results
function logTest(testName, passed, message = '', type = 'info') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = { testName, passed, message, type };
    testResults.tests.push(result);
    
    if (passed) {
        testResults.passed++;
        console.log(`${status}: ${testName}`, message ? `- ${message}` : '');
    } else {
        testResults.failed++;
        console.error(`${status}: ${testName}`, message ? `- ${message}` : '');
    }
}

function logWarning(testName, message) {
    testResults.warnings++;
    console.warn(`⚠️ WARNING: ${testName} - ${message}`);
}

// Test 1: Theme Toggle Button Existence
function testThemeToggleExists() {
    const themeToggle = document.querySelector('.theme-toggle');
    logTest('Theme Toggle Button Exists', !!themeToggle, 
        themeToggle ? `Found at ${themeToggle.style.bottom || 'unknown position'}` : 'Button not found in DOM');
    return !!themeToggle;
}

// Test 2: Search Button Functionality
function testSearchButton() {
    const searchButton = document.querySelector('.search-button');
    const hasOnClick = searchButton && (searchButton.onclick || searchButton.getAttribute('onclick'));
    const hasEventListener = searchButton && searchButton.addEventListener;
    
    logTest('Search Button Exists', !!searchButton, 
        searchButton ? 'Found in navbar' : 'Not found in navbar');
    
    if (searchButton) {
        logTest('Search Button Has Click Handler', !hasOnClick, 
            hasOnClick ? 'Has inline onclick (should be removed)' : 'Clean - uses event listeners');
    }
    
    return !!searchButton;
}

// Test 3: Skip Links Configuration
function testSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');
    const footerSkipLink = Array.from(skipLinks).find(link => 
        link.getAttribute('href') === '#footer' || link.textContent.includes('footer')
    );
    
    logTest('Skip Links Count', skipLinks.length <= 2, 
        `Found ${skipLinks.length} skip links (should be ≤2)`);
    
    logTest('No Footer Skip Link', !footerSkipLink, 
        footerSkipLink ? 'Footer skip link still exists' : 'Footer skip link properly removed');
}

// Test 4: Custom Cursor Elements
function testCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.custom-cursor-follower');
    const isDesktop = window.innerWidth > 768;
    
    if (isDesktop) {
        logTest('Custom Cursor Elements', cursor && cursorFollower, 
            `Cursor: ${!!cursor}, Follower: ${!!cursorFollower}`);
        
        if (cursor) {
            const cursorStyle = getComputedStyle(cursor);
            logTest('Custom Cursor Visible', cursorStyle.opacity !== '0' && cursorStyle.display !== 'none',
                `Opacity: ${cursorStyle.opacity}, Display: ${cursorStyle.display}`);
        }
    } else {
        logWarning('Custom Cursor Test', 'Skipped - mobile device detected');
    }
}

// Test 5: CSS Files Loading
function testCSSLoading() {
    const criticalFiles = [
        'global.css',
        'developer-theme.css', 
        'custom.css',
        'responsive-images.css'
    ];
    
    const loadedCSS = Array.from(document.styleSheets).map(sheet => 
        sheet.href ? sheet.href.split('/').pop() : 'inline'
    );
    
    criticalFiles.forEach(file => {
        const loaded = loadedCSS.some(loaded => loaded.includes(file));
        logTest(`CSS File: ${file}`, loaded, loaded ? 'Loaded' : 'Missing');
    });
}

// Test 6: JavaScript Functionality
function testJavaScript() {
    // Test if key objects exist
    const hasSearch = typeof siteSearch !== 'undefined';
    const hasThemeToggle = typeof applyTheme === 'function';
    const hasJQuery = typeof $ !== 'undefined';
    
    logTest('Search Object Available', hasSearch, 
        hasSearch ? 'siteSearch object found' : 'siteSearch not initialized');
    
    logTest('Theme Functions Available', hasThemeToggle,
        hasThemeToggle ? 'Theme functions loaded' : 'Theme functions missing');
    
    logTest('jQuery Loaded', hasJQuery,
        hasJQuery ? `jQuery version: ${$.fn.jquery || 'unknown'}` : 'jQuery not found');
}

// Test 7: Console Errors Check
function testConsoleErrors() {
    // This is a manual check - we can't automatically detect all console errors
    // but we can check for common issues
    
    console.log('\n📋 Manual Console Check Required:');
    console.log('   1. Look for any red error messages in console');
    console.log('   2. Check Network tab for failed requests');
    console.log('   3. Verify no 404 errors for CSS/JS files');
    
    logWarning('Console Errors', 'Manual check required - see above');
}

// Test 8: Performance Quick Check
function testPerformance() {
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.fetchStart;
            const domReady = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            
            logTest('Page Load Performance', loadTime < 5000, 
                `Load time: ${Math.round(loadTime)}ms (target: <5000ms)`);
            
            logTest('DOM Ready Performance', domReady < 3000,
                `DOM ready: ${Math.round(domReady)}ms (target: <3000ms)`);
        }
    } else {
        logWarning('Performance API', 'Not available in this browser');
    }
}

// Test 9: Theme Variables
function testThemeVariables() {
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--accent-primary').trim();
    const bgColor = rootStyles.getPropertyValue('--bg-primary').trim();
    
    logTest('CSS Variables Loaded', !!primaryColor && !!bgColor,
        `Primary: ${primaryColor}, Background: ${bgColor}`);
    
    // Check if theme class is applied
    const hasThemeClass = document.documentElement.classList.contains('dark-theme') || 
                         document.documentElement.classList.contains('light-theme');
    
    logTest('Theme Class Applied', hasThemeClass,
        `Theme classes: ${Array.from(document.documentElement.classList).join(', ')}`);
}

// Test 10: Mobile Responsiveness
function testResponsiveness() {
    const viewport = document.querySelector('meta[name="viewport"]');
    const isMobile = window.innerWidth <= 768;
    
    logTest('Viewport Meta Tag', !!viewport,
        viewport ? viewport.getAttribute('content') : 'Missing viewport meta tag');
    
    if (isMobile) {
        const navbar = document.querySelector('.navbar');
        const navToggle = document.querySelector('.navbar-toggler');
        
        logTest('Mobile Navigation', !!navToggle,
            navToggle ? 'Mobile hamburger menu found' : 'Mobile menu missing');
    }
}

// Run All Tests
async function runAllTests() {
    console.log('🔍 Running automated tests...\n');
    
    // Run tests
    testThemeToggleExists();
    testSearchButton();
    testSkipLinks();
    testCustomCursor();
    testCSSLoading();
    testJavaScript();
    testConsoleErrors();
    testPerformance();
    testThemeVariables();
    testResponsiveness();
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️ Warnings: ${testResults.warnings}`);
    console.log(`📋 Total Tests: ${testResults.tests.length}`);
    
    const successRate = (testResults.passed / (testResults.passed + testResults.failed) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All automated tests passed!');
        console.log('Proceed with manual testing for complete verification.');
    } else {
        console.log('\n🔧 Some tests failed. Review the issues above.');
        console.log('Failed tests:');
        testResults.tests
            .filter(test => !test.passed)
            .forEach(test => console.log(`   - ${test.testName}: ${test.message}`));
    }
    
    console.log('\n📖 For complete testing, run the manual testing script:');
    console.log('   manual-testing-script.md');
    
    return testResults;
}

// Interactive Test Functions
window.testSite = {
    runAll: runAllTests,
    testTheme: testThemeToggleExists,
    testSearch: testSearchButton,
    testCursor: testCustomCursor,
    testPerf: testPerformance,
    results: testResults
};

console.log('\n🚀 Test functions available:');
console.log('   testSite.runAll() - Run all tests');
console.log('   testSite.testTheme() - Test theme toggle');
console.log('   testSite.testSearch() - Test search button');
console.log('   testSite.testCursor() - Test custom cursor');
console.log('   testSite.testPerf() - Test performance');
console.log('   testSite.results - View test results');

// Auto-run if desired
console.log('\n▶️ Run testSite.runAll() to start automated testing');

// Quick Theme Toggle Test Function
window.testThemeToggle = function() {
    console.log('🎨 Testing theme toggle...');
    const button = document.querySelector('.theme-toggle');
    if (button) {
        console.log('Clicking theme toggle button...');
        button.click();
        setTimeout(() => {
            console.log('Theme toggle test complete. Check if theme changed.');
        }, 500);
    } else {
        console.error('❌ Theme toggle button not found!');
    }
};

// Quick Search Test Function  
window.testSearchModal = function() {
    console.log('🔍 Testing search modal...');
    const button = document.querySelector('.search-button');
    if (button) {
        console.log('Clicking search button...');
        button.click();
        setTimeout(() => {
            const modal = document.getElementById('search-modal');
            if (modal && modal.style.display !== 'none') {
                console.log('✅ Search modal opened successfully!');
                // Close it
                if (siteSearch && siteSearch.closeSearchModal) {
                    siteSearch.closeSearchModal();
                    console.log('🔒 Search modal closed.');
                }
            } else {
                console.error('❌ Search modal did not open!');
            }
        }, 200);
    } else {
        console.error('❌ Search button not found!');
    }
};

console.log('\n🧪 Quick test functions:');
console.log('   testThemeToggle() - Test theme switching');
console.log('   testSearchModal() - Test search modal');