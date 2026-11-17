'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const statsMod = require('../src/js/stats.js');

test('computeStats calculates count, min, max, mean, median (odd/even), change, and trend', () => {
  const oddStats = statsMod.computeStats([
    { label: 'Jan', value: 10 },
    { label: 'Fev', value: 30 },
    { label: 'Mar', value: 20 }
  ]);

  assert.equal(oddStats.count, 3);
  assert.deepEqual(oddStats.min, { label: 'Jan', value: 10, index: 0 });
  assert.deepEqual(oddStats.max, { label: 'Fev', value: 30, index: 1 });
  assert.equal(oddStats.mean, 20);
  assert.equal(oddStats.median, 20);
  assert.equal(oddStats.changeAbs, 10);
  assert.equal(oddStats.changePct, 100);
  assert.equal(oddStats.trend, 'crescente');

  const evenWithZero = statsMod.computeStats([
    { label: 'A', value: 0 },
    { label: 'B', value: 10 },
    { label: 'C', value: 20 },
    { label: 'D', value: 30 }
  ]);
  assert.equal(evenWithZero.median, 15);
  assert.equal(evenWithZero.changePct, null);
  assert.equal(evenWithZero.trend, 'crescente');
});
