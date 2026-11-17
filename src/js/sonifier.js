(function (root, factory) {
  'use strict';
  const exportsObj = factory(root);
  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObj;
  }
  root.DadosSonoros = root.DadosSonoros || {};
  root.DadosSonoros.sonifier = exportsObj;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const DEFAULT_MIN_FREQ = 220;
  const DEFAULT_MAX_FREQ = 880;
  const CONSTANT_FREQ = 440;

  function mapValueToFrequency(value, minVal, maxVal, options) {
    const opts = options || {};
    const scale = opts.scale === 'log' ? 'log' : 'linear';
    const minFreq = Number.isFinite(opts.minFreq) ? opts.minFreq : DEFAULT_MIN_FREQ;
    const maxFreq = Number.isFinite(opts.maxFreq) ? opts.maxFreq : DEFAULT_MAX_FREQ;

    if (maxVal === minVal) {
      return { frequency: CONSTANT_FREQ, usedFallbackLinear: false };
    }

    if (scale === 'log') {
      if (minVal > 0 && value > 0) {
        const logMin = Math.log10(minVal);
        const logMax = Math.log10(maxVal);
        const ratio = (Math.log10(value) - logMin) / (logMax - logMin);
        const freq = minFreq + ratio * (maxFreq - minFreq);
        return { frequency: Math.round(freq * 100) / 100, usedFallbackLinear: false };
      }
      const fallbackRatio = (value - minVal) / (maxVal - minVal);
      const fallbackFreq = minFreq + fallbackRatio * (maxFreq - minFreq);
      return { frequency: Math.round(fallbackFreq * 100) / 100, usedFallbackLinear: true };
    }

    const ratio = (value - minVal) / (maxVal - minVal);
    const freq = minFreq + ratio * (maxFreq - minFreq);
    return { frequency: Math.round(freq * 100) / 100, usedFallbackLinear: false };
  }

  function isWebAudioSupported() {
    try {
      return Boolean(root && (root.AudioContext || root.webkitAudioContext));
    } catch (_err) {
      return false;
    }
  }

  function createAudioEngine() {
    let ctx = null;
    let timerId = null;
    let isPlaying = false;
    let isPaused = false;
    let currentIndex = 0;

    function ensureContext() {
      const AudioCtx = root && (root.AudioContext || root.webkitAudioContext);
      if (!AudioCtx) {
        return { ok: false, reason: 'Web Audio API indisponível neste navegador.' };
      }
      try {
        if (!ctx) {
          ctx = new AudioCtx();
        }
        if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
          ctx.resume();
        }
        return { ok: true, ctx: ctx };
      } catch (err) {
        return { ok: false, reason: err && err.message ? err.message : 'Falha ao iniciar áudio.' };
      }
    }

    function playTone(frequency, durationSec, volumeNorm) {
      const res = ensureContext();
      if (!res.ok) {
        return { supported: false, reason: res.reason };
      }
      try {
        const audioCtx = res.ctx;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, now);

        const targetGain = Math.min(1, Math.max(0, volumeNorm)) * 0.28;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(Math.max(0.0001, targetGain), now + 0.015);
        gain.gain.setValueAtTime(Math.max(0.0001, targetGain), Math.max(now + 0.015, now + durationSec - 0.04));
        gain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + durationSec + 0.01);
        return { supported: true };
      } catch (_err) {
        return { supported: false, reason: 'Erro ao reproduzir tom.' };
      }
    }

    function stop() {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      isPlaying = false;
      isPaused = false;
      currentIndex = 0;
    }

    function pause() {
      if (!isPlaying) {
        return;
      }
      isPaused = !isPaused;
      if (isPaused && timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    }

    function playSeries(rows, options, onStep, onComplete) {
      stop();
      if (!Array.isArray(rows) || rows.length === 0) {
        return { supported: true };
      }
      const res = ensureContext();
      if (!res.ok) {
        return { supported: false, reason: res.reason };
      }

      const opts = options || {};
      const rate = Number(opts.playbackRate) || 1;
      const stepMs = Math.max(120, Math.round(320 / rate));
      const toneSec = Math.max(0.1, (stepMs * 0.7) / 1000);
      const minVal = opts.minVal;
      const maxVal = opts.maxVal;
      const scale = opts.scale || 'linear';
      const volume = Number.isFinite(opts.volume) ? opts.volume : 0.7;

      isPlaying = true;
      isPaused = false;
      currentIndex = 0;

      function tick() {
        if (!isPlaying) {
          return;
        }
        if (isPaused) {
          timerId = setTimeout(tick, 100);
          return;
        }
        if (currentIndex >= rows.length) {
          stop();
          if (typeof onComplete === 'function') {
            onComplete();
          }
          return;
        }
        const idx = currentIndex;
        const mapped = mapValueToFrequency(rows[idx].value, minVal, maxVal, { scale: scale });
        playTone(mapped.frequency, toneSec, volume);
        if (typeof onStep === 'function') {
          onStep(idx, mapped);
        }
        currentIndex += 1;
        timerId = setTimeout(tick, stepMs);
      }

      tick();
      return { supported: true };
    }

    function playReferenceMinMax(minVal, maxVal, options) {
      const opts = options || {};
      const scale = opts.scale || 'linear';
      const volume = Number.isFinite(opts.volume) ? opts.volume : 0.7;
      const minMapped = mapValueToFrequency(minVal, minVal, maxVal, { scale: scale });
      const maxMapped = mapValueToFrequency(maxVal, minVal, maxVal, { scale: scale });
      const first = playTone(minMapped.frequency, 0.22, volume);
      if (!first.supported) {
        return first;
      }
      setTimeout(function () {
        playTone(maxMapped.frequency, 0.26, volume);
      }, 280);
      return { supported: true };
    }

    return {
      playTone: playTone,
      playSeries: playSeries,
      pause: pause,
      stop: stop,
      playReferenceMinMax: playReferenceMinMax
    };
  }

  return Object.freeze({
    DEFAULT_MIN_FREQ: DEFAULT_MIN_FREQ,
    DEFAULT_MAX_FREQ: DEFAULT_MAX_FREQ,
    CONSTANT_FREQ: CONSTANT_FREQ,
    mapValueToFrequency: mapValueToFrequency,
    isWebAudioSupported: isWebAudioSupported,
    createAudioEngine: createAudioEngine
  });
});
