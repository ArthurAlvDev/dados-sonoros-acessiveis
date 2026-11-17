'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const statsMod = require('../src/js/stats.js');
const chartModel = require('../src/js/chart-model.js');
const exporter = require('../src/js/exporter.js');

test('buildAccessibleHtmlPackage escapes XSS payloads and includes SVG + semantic table', () => {
  const state = {
    title: '<script>alert(1)</script> Título',
    chartType: 'bar',
    rows: [
      { label: '<img src=x onerror=alert(1)>', value: 10 },
      { label: 'Fev', value: 20 }
    ]
  };
  const stats = statsMod.computeStats(state.rows);
  const model = chartModel.buildChartModel(state.rows, 'bar', { activeIndex: 0 });
  const html = exporter.buildAccessibleHtmlPackage(state, stats, model);

  assert.equal(html.includes('<script>alert(1)</script>'), false);
  assert.equal(html.includes('<img src=x'), false);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /<svg\s+role="img"/);
  assert.match(html, /<table><caption>/);
});

test('buildJsonExport and buildCsvExport generate valid structured outputs', () => {
  const rows = [
    { label: 'Jan, 2026', value: 15 },
    { label: 'Fev', value: 30 }
  ];
  const stats = statsMod.computeStats(rows);
  const json = JSON.parse(exporter.buildJsonExport({ title: 'Teste', rows }, stats, '2026-11-17T12:00:00.000Z'));

  assert.equal(json.tool, 'Dados Sonoros');
  assert.equal(json.summary.count, 2);
  assert.equal(json.rows.length, 2);

  const csv = exporter.buildCsvExport(rows);
  assert.match(csv, /^label,value\n"Jan, 2026",15\nFev,30\n$/);
});
