'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const chartModel = require('../src/js/chart-model.js');

test('buildChartModel generates bar and line geometry with distinct pattern IDs', () => {
  const rows = [
    { label: 'Jan', value: 10 },
    { label: 'Fev', value: 25 },
    { label: 'Mar', value: 15 }
  ];

  const barModel = chartModel.buildChartModel(rows, 'bar', { activeIndex: 1 });
  assert.equal(barModel.chartType, 'bar');
  assert.equal(barModel.items.length, 3);
  assert.equal(barModel.items[0].patternId, chartModel.PATTERN_IDS.series1);
  assert.equal(barModel.items[1].patternId, chartModel.PATTERN_IDS.active);
  assert.equal(barModel.items[1].isActive, true);

  const lineModel = chartModel.buildChartModel(rows, 'line', { activeIndex: 2 });
  assert.equal(lineModel.chartType, 'line');
  assert.equal(lineModel.items[2].isActive, true);
});

test('formatPointAnnouncement formats first point and delta announcements for aria-live', () => {
  const rows = [
    { label: 'Jan', value: 20 },
    { label: 'Fev', value: 32 }
  ];

  assert.match(chartModel.formatPointAnnouncement(rows, 0), /^Ponto 1 de 2: Jan, valor 20\./);
  assert.match(
    chartModel.formatPointAnnouncement(rows, 1),
    /^Ponto 2 de 2: Fev, valor 32\. Variação de \+12 em relação a Jan\./
  );
});
