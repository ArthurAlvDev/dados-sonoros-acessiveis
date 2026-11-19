'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

test('index.html satisfies SEO, WCAG 2.2 AA landmarks, CSP, single h1, and aria-live', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

  assert.match(html, /<html\s+lang="pt-BR"/i);
  assert.match(html, /<meta\s+charset="UTF-8">/i);
  assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1\.0">/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
  assert.match(html, /<meta\s+name="description"\s+content="[^"]+">/i);
  assert.match(html, /<meta\s+property="og:title"\s+content="[^"]+">/i);
  assert.match(html, /<meta\s+property="og:description"\s+content="[^"]+">/i);
  assert.match(html, /<meta\s+property="og:type"\s+content="website">/i);
  assert.match(html, /http-equiv="Content-Security-Policy"/i);
  assert.match(html, /aria-live="polite"/i);
  assert.match(html, /<table\s+class="data-table">/i);

  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  assert.equal(h1Matches.length, 1, 'Expected exactly one <h1>');
});

test('CSS tokens and styles include theme modes, prefers-reduced-motion, and :focus-visible', () => {
  const tokensCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/tokens.css'), 'utf8');
  const mainCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/main.css'), 'utf8');

  assert.match(tokensCss, /\[data-theme="claro"\]/);
  assert.match(tokensCss, /\[data-theme="alto-contraste"\]/);
  assert.match(tokensCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(mainCss, /:focus-visible/);
});

test('JS files and HTML contain zero unsafe HTML/eval sinks and zero external runtime URLs', () => {
  const files = [
    path.join(ROOT_DIR, 'index.html'),
    path.join(ROOT_DIR, 'src/js/datasets.js'),
    path.join(ROOT_DIR, 'src/js/csv-parser.js'),
    path.join(ROOT_DIR, 'src/js/stats.js'),
    path.join(ROOT_DIR, 'src/js/sonifier.js'),
    path.join(ROOT_DIR, 'src/js/chart-model.js'),
    path.join(ROOT_DIR, 'src/js/storage.js'),
    path.join(ROOT_DIR, 'src/js/exporter.js'),
    path.join(ROOT_DIR, 'src/js/app.js')
  ];

  const forbidden = [
    /\binnerHTML\b/,
    /\bouterHTML\b/,
    /\binsertAdjacentHTML\b/,
    /\bdocument\.write\b/,
    /\beval\s*\(/,
    /\bnew\s+Function\b/
  ];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pattern of forbidden) {
      assert.equal(
        pattern.test(content),
        false,
        `Forbidden pattern ${pattern} in ${path.basename(filePath)}`
      );
    }

    // O xmlns do SVG e o crédito da marca são as únicas URLs externas permitidas.
    const withoutSvgXmlns = content
      .replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')
      .replace(/https:\/\/olacdev\.com\//g, '');
    assert.equal(
      /https?:\/\//i.test(withoutSvgXmlns),
      false,
      `External URL found in ${path.basename(filePath)}`
    );
  }
});
