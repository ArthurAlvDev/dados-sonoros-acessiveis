'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const csvParser = require('../src/js/csv-parser.js');

test('parseCsv supports comma, semicolon (with decimal comma), tab, quotes, and optional header', () => {
  const commaRes = csvParser.parseCsv('Mês,Valor\n"Jan, 2026",24.5\nFev,27');
  assert.equal(commaRes.ok, true);
  assert.equal(commaRes.delimiter, ',');
  assert.deepEqual(commaRes.rows, [
    { label: 'Jan, 2026', value: 24.5 },
    { label: 'Fev', value: 27 }
  ]);

  const semiRes = csvParser.parseCsv('Item;Preço\nCafé;12,5\nPão;4,25');
  assert.equal(semiRes.ok, true);
  assert.equal(semiRes.delimiter, ';');
  assert.deepEqual(semiRes.rows, [
    { label: 'Café', value: 12.5 },
    { label: 'Pão', value: 4.25 }
  ]);

  const tabRes = csvParser.parseCsv('A\t10\nB\t20');
  assert.equal(tabRes.ok, true);
  assert.equal(tabRes.delimiter, '\t');
  assert.equal(tabRes.rows.length, 2);
});

test('parseCsv reports exact line on invalid number and rejects < 2 points or > 500 rows', () => {
  const badNum = csvParser.parseCsv('Mês,Valor\nJan,10\nFev,abc\nMar,30');
  assert.equal(badNum.ok, false);
  assert.equal(badNum.line, 3);

  const tooFew = csvParser.parseCsv('Mês,Valor\nJan,10');
  assert.equal(tooFew.ok, false);

  const bigLines = ['Label,Value'];
  for (let i = 1; i <= 501; i += 1) {
    bigLines.push(`Item ${i},${i}`);
  }
  const overLimit = csvParser.parseCsv(bigLines.join('\n'));
  assert.equal(overLimit.ok, false);
});
