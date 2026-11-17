(function (root, factory) {
  'use strict';
  const datasets = (typeof module === 'object' && module.exports)
    ? require('./datasets.js')
    : (root.DadosSonoros && root.DadosSonoros.datasets);
  const exportsObj = factory(datasets);
  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObj;
  }
  root.DadosSonoros = root.DadosSonoros || {};
  root.DadosSonoros.storage = exportsObj;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (datasets) {
  'use strict';

  const STORAGE_KEY = 'dados_sonoros_v1_state';
  const STORAGE_WARNING = 'Armazenamento local indisponível; alterações valem apenas nesta aba.';

  const VALID_CHARTS = new Set(['bar', 'line']);
  const VALID_THEMES = new Set(['default', 'high-contrast']);
  const VALID_SCALES = new Set(['linear', 'log']);
  const VALID_RATES = new Set([0.75, 1, 1.5, 2]);

  function createDefaultState() {
    const sample = datasets.getSampleDataset('temperatura');
    return {
      version: 1,
      title: sample.title,
      chartType: sample.chartType,
      theme: 'default',
      audioScale: 'linear',
      playbackRate: 1,
      rows: sample.rows
    };
  }

  function normalizeState(raw) {
    const defaults = createDefaultState();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) {
      return defaults;
    }

    const rows = [];
    if (Array.isArray(raw.rows)) {
      for (let i = 0; i < raw.rows.length && rows.length < 500; i += 1) {
        const r = raw.rows[i];
        if (r && typeof r === 'object' && typeof r.label === 'string' && Number.isFinite(r.value)) {
          const cleanLabel = r.label.trim().slice(0, 80);
          if (cleanLabel) {
            rows.push({ label: cleanLabel, value: r.value });
          }
        }
      }
    }

    const rateNum = Number(raw.playbackRate);
    return {
      version: 1,
      title: typeof raw.title === 'string' ? raw.title.slice(0, 120) : defaults.title,
      chartType: VALID_CHARTS.has(raw.chartType) ? raw.chartType : defaults.chartType,
      theme: VALID_THEMES.has(raw.theme) ? raw.theme : defaults.theme,
      audioScale: VALID_SCALES.has(raw.audioScale) ? raw.audioScale : defaults.audioScale,
      playbackRate: VALID_RATES.has(rateNum) ? rateNum : defaults.playbackRate,
      rows: rows.length >= 2 ? rows : defaults.rows
    };
  }

  function loadState(storageObj) {
    if (!storageObj || typeof storageObj.getItem !== 'function') {
      return { state: createDefaultState(), persistent: false, warning: STORAGE_WARNING };
    }
    let rawText = null;
    try {
      rawText = storageObj.getItem(STORAGE_KEY);
    } catch (_err) {
      return { state: createDefaultState(), persistent: false, warning: STORAGE_WARNING };
    }
    if (!rawText) {
      return { state: createDefaultState(), persistent: true, warning: null };
    }
    try {
      const parsed = JSON.parse(rawText);
      return { state: normalizeState(parsed), persistent: true, warning: null };
    } catch (_err) {
      return { state: createDefaultState(), persistent: true, warning: null };
    }
  }

  function saveState(state, storageObj) {
    const normalized = normalizeState(state);
    if (!storageObj || typeof storageObj.setItem !== 'function') {
      return { state: normalized, persistent: false, warning: STORAGE_WARNING };
    }
    try {
      storageObj.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return { state: normalized, persistent: true, warning: null };
    } catch (_err) {
      return { state: normalized, persistent: false, warning: STORAGE_WARNING };
    }
  }

  function clearState(storageObj) {
    return saveState(createDefaultState(), storageObj);
  }

  return Object.freeze({
    STORAGE_KEY: STORAGE_KEY,
    STORAGE_WARNING: STORAGE_WARNING,
    createDefaultState: createDefaultState,
    normalizeState: normalizeState,
    loadState: loadState,
    saveState: saveState,
    clearState: clearState
  });
});
