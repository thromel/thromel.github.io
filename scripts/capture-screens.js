const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4000';
const OUT = process.env.OUT_DIR || 'output/playwright/overhaul-v2';

const pages = [
  ['home', '/'],
  ['projects', '/projects'],
  ['contributions', '/contributions'],
  ['publications', '/publications'],
  ['research', '/research'],
  ['education', '/education'],
  ['blog', '/blog/'],
  ['404', '/404.html'],
];

(async () => {
  const browser = await chromium.launch();
  for (const [theme, viewport] of [
    ['light', { width: 1440, height: 900 }],
    ['dark', { width: 1440, height: 900 }],
    ['light-mobile', { width: 390, height: 844 }],
    ['dark-mobile', { width: 390, height: 844 }],
  ]) {
    const dark = theme.startsWith('dark');
    const ctx = await browser.newContext({ viewport });
    await ctx.addInitScript((t) => localStorage.setItem('theme', t), dark ? 'dark' : 'light');
    for (const [name, path] of pages) {
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${OUT}/${name}-${theme}.png`, fullPage: true });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
})();
