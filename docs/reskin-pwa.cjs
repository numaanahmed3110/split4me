const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname);
const file = path.join(root, 'ui-preview.html');

// Off-palette hex -> canonical palette / unified semantic color.
// Google brand colors (#4285F4 #34A853 #FBBC05 #EA4335) are intentionally EXCLUDED
// (they only appear in the authentic Google logo SVG).
const map = {
  // greys -> canonical neutral greys
  '#6B7280': '#9CA3AF',
  '#C4C4C4': '#9CA3AF',
  '#D1D5DB': '#EBEBEB',
  '#E5E7EB': '#EBEBEB',
  '#E8E8E8': '#EBEBEB',
  '#F3F4F6': '#F5F5F5',
  '#FAFAFA': '#FFFFFF',
  // near-black / dark variants -> canonical dark card
  '#0B0B0B': '#1C1C1E',
  '#1A1730': '#1D1C22',
  '#1C1B22': '#1D1C22',
  '#221E35': '#1D1C22',
  '#2A2930': '#1D1C22',
  '#3E3B62': '#1D1C22',
  // extra greens -> single semantic green
  '#1DD186': '#16A34A',
  '#28C840': '#16A34A',
  '#38A97A': '#16A34A',
  '#4ADE80': '#16A34A',
  '#54CC92': '#16A34A',
  // extra reds -> single semantic red
  '#DA291C': '#DC2626',
  '#FF5F57': '#DC2626',
  // soft red tints -> pastel red tint
  '#F4D3C5': '#FCE8E6',
  '#FDE0E0': '#FCE8E6',
  '#FDECEC': '#FCE8E6',
  '#FEE2E2': '#FCE8E6',
  // stray blues -> palette pastels
  '#4A81A5': '#D8CEFA',
  '#63BDEB': '#E0F4F5',
  // ambers / peaches -> palette yellows
  '#E3B128': '#E6D799',
  '#E6AC00': '#E6D799',
  '#FFBD2E': '#FDECAD',
  '#FFC72C': '#FDECAD',
  '#FFC973': '#FDECAD',
  '#FFE4B5': '#FDECAD',
  '#F3E0B0': '#FDECAD',
  '#F5E6D0': '#FDECAD',
  '#F8EDDF': '#FDECAD',
  // light purple / teal tints -> palette
  '#E8D5F5': '#E8E2FC',
  '#729699': '#CDE6E8',
  '#D5ECE8': '#CDE6E8',
};

let html = fs.readFileSync(file, 'utf8');
let changed = 0;
for (const [from, to] of Object.entries(map)) {
  const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  html = html.replace(re, (m) => {
    changed++;
    // preserve original letter-case style by using uppercase canonical (file is mixed-case)
    return to;
  });
}
fs.writeFileSync(file, html, 'utf8');
console.log('PWA reskin: replaced', changed, 'color occurrences in ui-preview.html');

// ---- regenerate per-screen PWA files from the reskinned preview ----
const outDir = path.join(root, 'ui-mocks', 'pwa');
fs.mkdirSync(outDir, { recursive: true });
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const baseCss = styleMatch ? styleMatch[1] : '';
const names = {1:'landing',2:'onboard-voice',3:'onboard-ledger',4:'onboard-split',5:'signin',6:'signup',7:'dashboard',8:'split-detail',9:'expenses',10:'create-expense',11:'balances',12:'stats',13:'group-info',14:'activity',15:'ocr-preview',16:'split-now',17:'create-group',18:'split-modes',19:'receipt-scan',20:'group-settings',21:'empty-states',22:'dark-mode'};
const re = /<section class="screen-section" id="s(\d+)">([\s\S]*?)<\/section>/g;
let m, sections = {};
while ((m = re.exec(html)) !== null) sections[parseInt(m[1],10)] = m[2];
let count = 0;
for (const [num, slug] of Object.entries(names)) {
  const body = sections[num];
  if (!body) { console.warn('Missing s'+num); continue; }
  const doc = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>split4me · PWA · ${slug}</title>\n<style>\n${baseCss}\n</style>\n</head>\n<body style="background:#1a1a2e;padding:40px 20px;min-height:100vh">\n${body}\n</body>\n</html>\n`;
  fs.writeFileSync(path.join(outDir, `s${num.padStart(2,'0')}-${slug}.html`), doc, 'utf8');
  count++;
}
console.log('Regenerated', count, 'PWA per-screen files.');
