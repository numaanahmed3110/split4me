const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname);
const preview = 'file://' + path.join(root, 'ui-preview-web.html').replace(/\\/g, '/');
const outDir = path.join(root, 'verify');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  await page.goto(preview, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  for (let n = 1; n <= 22; n++) {
    const sel = `#s${n}`;
    const el = await page.$(sel);
    if (!el) { console.log('MISSING', sel); continue; }
    const file = path.join(outDir, `s${String(n).padStart(2,'0')}.png`);
    await el.screenshot({ path: file, fullPage: false });
    console.log('shot', path.basename(file));
  }

  await browser.close();
  console.log('\\nConsole/page errors:', errors.length ? errors.join('\\n') : 'none');
})();
