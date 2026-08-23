const { chromium } = require('playwright');
const path = require('path');

const root = path.resolve(__dirname);
const preview = 'file://' + path.join(root, 'ui-preview-web.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  await page.goto(preview, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const report = await page.evaluate(() => {
    const out = {};
    // 1. Fonts
    out.fontsPoppins = document.fonts.check('700 40px Poppins');
    out.fontsReady = document.fonts.status;
    // 2. Page horizontal overflow
    out.docScrollW = document.documentElement.scrollWidth;
    out.winW = window.innerWidth;
    out.pageOverflowX = document.documentElement.scrollWidth - window.innerWidth;
    // 3. Design tokens on a sample card + button
    const card = document.querySelector('.card');
    const btn = document.querySelector('.btn');
    if (card) {
      const cs = getComputedStyle(card);
      out.cardBorderRadius = cs.borderRadius;
      out.cardBoxShadow = cs.boxShadow.slice(0, 40);
      out.cardBg = cs.backgroundColor;
    }
    if (btn) {
      const cs = getComputedStyle(btn);
      out.btnBorderRadius = cs.borderRadius;
      out.btnFont = cs.fontFamily;
    }
    // 4. Landing hero h1
    const h1 = document.querySelector('#s1 h1');
    if (h1) {
      const cs = getComputedStyle(h1);
      out.heroH1Text = h1.textContent.trim().slice(0, 40);
      out.heroH1Size = cs.fontSize;
      out.heroH1Font = cs.fontFamily;
    }
    // 5. Per-section health
    const secs = [];
    for (let n = 1; n <= 22; n++) {
      const el = document.querySelector(`#s${n}`);
      if (!el) { secs.push({ n, missing: true }); continue; }
      const r = el.getBoundingClientRect();
      const overflowX = el.scrollWidth - el.clientWidth;
      secs.push({ n, w: Math.round(r.width), h: Math.round(r.height), overflowX });
    }
    out.sections = secs;
    return out;
  });

  // Per-screen standalone file load check (a few key ones)
  report.standaloneLoad = {};
  for (const f of ['s01-landing','s07-dashboard','s22-dark-mode']) {
    const url = 'file://' + path.join(root,'ui-mocks','web',`${f}.html`).replace(/\\/g,'/');
    const errs = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const title = await page.title();
    report.standaloneLoad[f] = { title, errors: errs };
  }

  await browser.close();
  report.consoleErrors = errors;
  console.log(JSON.stringify(report, null, 2));
})();
