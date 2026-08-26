#!/usr/bin/env node
/**
 * Builds scrollable all-screens gallery pages for PWA and Web mockups.
 *
 *   node docs/build-screen-galleries.cjs
 *
 * Outputs:
 *   docs/all-screens-pwa.html  — all 32 PWA phone mockups in one page
 *   docs/all-screens-web.html  — all web mockups (via gen-web.cjs)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname);
const pwaSrc = path.join(root, 'ui-preview.html');
const pwaOut = path.join(root, 'all-screens-pwa.html');

if (!fs.existsSync(pwaSrc)) {
  console.error('Missing', pwaSrc);
  process.exit(1);
}

let pwaHtml = fs.readFileSync(pwaSrc, 'utf8');
pwaHtml = pwaHtml.replace(
  /<title>.*?<\/title>/,
  '<title>split4me — All PWA Screens (Gallery)</title>',
);
fs.writeFileSync(pwaOut, pwaHtml, 'utf8');
console.log('Wrote all-screens-pwa.html (from ui-preview.html)');

execSync('node gen-web.cjs', { cwd: root, stdio: 'inherit' });
console.log('\nGallery pages ready:');
console.log('  PWA: docs/all-screens-pwa.html');
console.log('  Web: docs/all-screens-web.html');
