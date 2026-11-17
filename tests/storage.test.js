'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const storageMod = require('../src/js/storage.js');

function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(k) {
      return store.has(k) ? store.get(k) : null;
    },
    setItem(k, v) {
      store.set(k, String(v));
    }
  };
}

test('saveState and loadState persist dados_sonoros_v1_state and recover from corrupted JSON', () => {
  const mock = createMockStorage();
  const saved = storageMod.saveState(
    {
      version: 1,
      title: 'Minha Série',
      chartType: 'bar',
      theme: 'high-contrast',
      audioScale: 'log',
      playbackRate: 1.5,
      rows: [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 }
      ]
    },
    mock
  );

  assert.equal(saved.persistent, true);
  const loaded = storageMod.loadState(mock);
  assert.equal(loaded.state.title, 'Minha Série');
  assert.equal(loaded.state.theme, 'high-contrast');
  assert.equal(loaded.state.rows.length, 2);

  const corrupt = createMockStorage({ [storageMod.STORAGE_KEY]: '{invalid-json' });
  const fallback = storageMod.loadState(corrupt);
  assert.equal(fallback.state.version, 1);
  assert.ok(fallback.state.rows.length >= 2);
});

test('storage errors fall back to memory with persistent: false', () => {
  const restricted = {
    getItem() {
      throw new Error('SecurityError');
    },
    setItem() {
      throw new Error('QuotaExceededError');
    }
  };

  const loaded = storageMod.loadState(restricted);
  assert.equal(loaded.persistent, false);
  assert.ok(loaded.warning);

  const saved = storageMod.saveState(storageMod.createDefaultState(), restricted);
  assert.equal(saved.persistent, false);
  assert.ok(saved.warning);
});
