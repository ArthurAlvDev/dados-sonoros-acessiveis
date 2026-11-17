'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const sonifier = require('../src/js/sonifier.js');

test('mapValueToFrequency maps linear (220-880Hz), log, fallback linear on <=0, and constant 440Hz', () => {
  assert.deepEqual(sonifier.mapValueToFrequency(10, 10, 100, { scale: 'linear' }), {
    frequency: 220,
    usedFallbackLinear: false
  });
  assert.deepEqual(sonifier.mapValueToFrequency(100, 10, 100, { scale: 'linear' }), {
    frequency: 880,
    usedFallbackLinear: false
  });

  const logMid = sonifier.mapValueToFrequency(100, 10, 1000, { scale: 'log' });
  assert.equal(logMid.frequency, 550);
  assert.equal(logMid.usedFallbackLinear, false);

  const logFallback = sonifier.mapValueToFrequency(5, 0, 10, { scale: 'log' });
  assert.equal(logFallback.frequency, 550);
  assert.equal(logFallback.usedFallbackLinear, true);

  assert.deepEqual(sonifier.mapValueToFrequency(42, 42, 42, { scale: 'linear' }), {
    frequency: 440,
    usedFallbackLinear: false
  });
});

test('audio engine degrades gracefully when AudioContext is unavailable', () => {
  assert.equal(sonifier.isWebAudioSupported(), false);
  const engine = sonifier.createAudioEngine();
  const res = engine.playTone(440, 0.2, 0.7);
  assert.equal(res.supported, false);
  assert.ok(res.reason);
});
