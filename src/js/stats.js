(function (root, factory) {
  'use strict';
  const exportsObj = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObj;
  }
  root.DadosSonoros = root.DadosSonoros || {};
  root.DadosSonoros.stats = exportsObj;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function computeStats(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    let min = { label: rows[0].label, value: rows[0].value, index: 0 };
    let max = { label: rows[0].label, value: rows[0].value, index: 0 };
    let sum = 0;

    for (let i = 0; i < rows.length; i += 1) {
      const r = rows[i];
      sum += r.value;
      if (r.value < min.value) {
        min = { label: r.label, value: r.value, index: i };
      }
      if (r.value > max.value) {
        max = { label: r.label, value: r.value, index: i };
      }
    }

    const count = rows.length;
    const mean = round2(sum / count);

    const sorted = rows.map(function (r) { return r.value; }).sort(function (a, b) { return a - b; });
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 1
      ? round2(sorted[mid])
      : round2((sorted[mid - 1] + sorted[mid]) / 2);

    const first = rows[0].value;
    const last = rows[count - 1].value;
    const changeAbs = round2(last - first);
    const changePct = first === 0 ? null : round2(((last - first) / Math.abs(first)) * 100);

    let trend = 'estável';
    if (changePct !== null) {
      if (changePct > 2) {
        trend = 'crescente';
      } else if (changePct < -2) {
        trend = 'decrescente';
      }
    } else if (changeAbs > 0) {
      trend = 'crescente';
    } else if (changeAbs < 0) {
      trend = 'decrescente';
    }

    return {
      count: count,
      min: min,
      max: max,
      mean: mean,
      median: median,
      changeAbs: changeAbs,
      changePct: changePct,
      trend: trend
    };
  }

  return Object.freeze({
    computeStats: computeStats
  });
});
