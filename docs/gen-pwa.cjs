const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const src = path.join(root, 'ui-preview.html');
const outDir = path.join(root, 'ui-mocks', 'pwa');
fs.mkdirSync(outDir, { recursive: true });

const html = fs.readFileSync(src, 'utf8');

// Extract the base <style> block (design system)
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const baseCss = styleMatch ? styleMatch[1] : '';

// Map of id -> filename slug
const names = {
  1: 'landing', 2: 'onboard-voice', 3: 'onboard-ledger', 4: 'onboard-split',
  5: 'signin', 6: 'signup', 7: 'dashboard', 8: 'split-detail', 9: 'expenses',
  10: 'create-expense', 11: 'balances', 12: 'stats', 13: 'group-info',
  14: 'activity', 15: 'ocr-preview', 16: 'split-now', 17: 'create-group',
  18: 'split-modes', 19: 'receipt-scan', 20: 'group-settings', 21: 'empty-states',
  22: 'dark-mode',
};

// Extract every <section class="screen-section" id="sN"> ... </section>
const re = /<section class="screen-section" id="s(\d+)">([\s\S]*?)<\/section>/g;
let m;
const sections = {};
while ((m = re.exec(html)) !== null) {
  sections[parseInt(m[1], 10)] = m[2];
}

let count = 0;
for (const [num, slug] of Object.entries(names)) {
  const body = sections[num];
  if (!body) { console.warn('Missing section s' + num); continue; }
  const file = `s${num.padStart(2, '0')}-${slug}.html`;
  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>split4me · PWA · ${slug}</title>
    <style>
${baseCss}
    </style>
</head>
<body style="background:#1a1a2e;padding:40px 20px;min-height:100vh">
${body}
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, file), doc, 'utf8');
  count++;
  console.log('Wrote', file);
}
console.log(`\nDone. ${count} PWA screen files written to docs/ui-mocks/pwa/`);
