const { chromium } = require('playwright');
const path = require('path');
const root = path.resolve(__dirname);

function urlOf(rel){ return 'file://' + path.join(root, rel).replace(/\\/g,'/'); }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const rel of ['ui-preview.html', 'ui-preview-web.html']) {
    await page.goto(urlOf(rel), { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const data = await page.evaluate(() => {
      const bg = new Set(), fg = new Set(), sh = new Set();
      const walk = el => {
        const cs = getComputedStyle(el);
        if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') bg.add(cs.backgroundColor);
        if (cs.color) fg.add(cs.color);
        if (cs.boxShadow && cs.boxShadow !== 'none') {
          const m = cs.boxShadow.match(/rgba?\([^)]+\)/g);
          if (m) m.forEach(x => sh.add(x));
        }
        if (cs.borderColor && cs.borderColor !== 'rgba(0, 0, 0, 0)' && cs.borderColor !== 'transparent') fg.add('BORDER:'+cs.borderColor);
        for (const c of el.children) walk(c);
      };
      walk(document.body);
      // root vars
      const rootCs = getComputedStyle(document.documentElement);
      const vars = {};
      for (const k of rootCs) { if (k.startsWith('--')) vars[k] = rootCs.getPropertyValue(k).trim(); }
      return { bg:[...bg], fg:[...fg], sh:[...sh], vars };
    });
    console.log('\n========== ' + rel + ' ==========');
    console.log('BACKGROUND colors (' + data.bg.length + '):'); console.log(data.bg.join('\n'));
    console.log('\nTEXT/BORDER colors (' + data.fg.length + '):'); console.log(data.fg.join('\n'));
    console.log('\nSHADOW colors (' + data.sh.length + '):'); console.log(data.sh.join('\n'));
    console.log('\nCSS VARS:'); console.log(JSON.stringify(data.vars, null, 1));
  }
  await browser.close();
})();
