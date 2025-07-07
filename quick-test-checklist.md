# Quick Test Checklist for tanzimhromel.com

## 🚀 **CRITICAL TESTS (2 minutes)**

### Must Work:
- [ ] **Theme Toggle** - Blue button bottom-right, switches dark/light theme
- [ ] **Search Button** - Magnifying glass in navbar opens search modal (NOT footer)
- [ ] **Custom Cursor** - Blue dot follows mouse on desktop
- [ ] **Mobile Menu** - Hamburger menu works on mobile

### Quick Steps:
1. Visit https://tanzimhromel.com
2. Click theme toggle (bottom-right) → Should switch themes
3. Click search button (navbar) → Should open search modal
4. Move mouse around → Should see custom cursor (desktop only)
5. Resize to mobile → Should see hamburger menu

---

## 🔧 **BROWSER CONSOLE TESTS**

Copy/paste into browser console (F12):

```javascript
// Quick automated test
fetch('/browser-console-tests.js')
  .then(r => r.text())
  .then(code => {
    eval(code);
    testSite.runAll();
  })
  .catch(() => console.log('Run manual tests instead'));

// Manual quick tests
testThemeToggle();  // Test theme switching
testSearchModal();  // Test search modal
```

---

## ✅ **PASS CRITERIA**

All these should work:
- Theme toggle changes appearance smoothly
- Search opens modal (no redirect to footer)
- Custom cursor follows mouse on desktop
- No JavaScript errors in console
- Page loads under 3 seconds

---

## 📱 **MOBILE TEST**

Resize browser to mobile width:
- Hamburger menu appears
- Theme toggle still visible
- Search still works
- Touch interactions responsive

---

*Quick test should take under 3 minutes*