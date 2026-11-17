(function (root, factory) {
  'use strict';
  const exportsObj = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObj;
  }
  root.DadosSonoros = root.DadosSonoros || {};
  root.DadosSonoros.chartModel = exportsObj;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VIEWBOX = { width: 720, height: 360 };
  const PADDING = { top: 36, right: 28, bottom: 54, left: 64 };
  const PATTERN_IDS = Object.freeze({
    series1: 'pattern-diagonal',
    active: 'pattern-active-dots'
  });

  function formatPointAnnouncement(rows, index) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return 'Nenhum ponto disponível.';
    }
    const safeIdx = Math.min(rows.length - 1, Math.max(0, index));
    const current = rows[safeIdx];
    const base = 'Ponto ' + (safeIdx + 1) + ' de ' + rows.length + ': ' + current.label + ', valor ' + current.value + '.';

    if (safeIdx === 0) {
      return base + ' Primeiro ponto da série.';
    }
    const prev = rows[safeIdx - 1];
    const delta = Math.round((current.value - prev.value) * 100) / 100;
    const sign = delta > 0 ? '+' : '';
    return base + ' Variação de ' + sign + delta + ' em relação a ' + prev.label + '.';
  }

  function buildChartModel(rows, chartType, options) {
    const type = chartType === 'line' ? 'line' : 'bar';
    const opts = options || {};
    const activeIndex = Number.isInteger(opts.activeIndex) ? opts.activeIndex : 0;
    const list = Array.isArray(rows) ? rows : [];

    const plotW = VIEWBOX.width - PADDING.left - PADDING.right;
    const plotH = VIEWBOX.height - PADDING.top - PADDING.bottom;

    if (list.length === 0) {
      return {
        viewBox: VIEWBOX,
        padding: PADDING,
        chartType: type,
        patternIds: PATTERN_IDS,
        items: [],
        ticks: []
      };
    }

    let minVal = list[0].value;
    let maxVal = list[0].value;
    for (let i = 1; i < list.length; i += 1) {
      if (list[i].value < minVal) minVal = list[i].value;
      if (list[i].value > maxVal) maxVal = list[i].value;
    }

    const yMin = type === 'bar' ? Math.min(0, minVal) : minVal;
    let yMax = maxVal;
    if (yMax === yMin) {
      yMax = yMin + 1;
    }

    function valueToY(val) {
      const ratio = (val - yMin) / (yMax - yMin);
      return Math.round((PADDING.top + plotH - ratio * plotH) * 100) / 100;
    }

    const baselineY = valueToY(Math.max(yMin, 0));
    const slotW = plotW / list.length;
    const barW = Math.max(12, Math.min(56, slotW * 0.62));

    const items = list.map(function (row, idx) {
      const cx = Math.round((PADDING.left + slotW * idx + slotW / 2) * 100) / 100;
      const y = valueToY(row.value);
      const isActive = idx === activeIndex;
      const barTop = Math.min(y, baselineY);
      const barHeight = Math.max(4, Math.abs(baselineY - y));

      return {
        index: idx,
        label: row.label,
        value: row.value,
        isActive: isActive,
        cx: cx,
        cy: y,
        barX: Math.round((cx - barW / 2) * 100) / 100,
        barY: Math.round(barTop * 100) / 100,
        barWidth: Math.round(barW * 100) / 100,
        barHeight: Math.round(barHeight * 100) / 100,
        patternId: isActive ? PATTERN_IDS.active : PATTERN_IDS.series1
      };
    });

    const ticks = [0, 0.5, 1].map(function (t) {
      const val = Math.round((yMin + (yMax - yMin) * t) * 100) / 100;
      return {
        value: val,
        y: valueToY(val)
      };
    });

    return {
      viewBox: VIEWBOX,
      padding: PADDING,
      chartType: type,
      patternIds: PATTERN_IDS,
      baselineY: baselineY,
      items: items,
      ticks: ticks
    };
  }

  return Object.freeze({
    VIEWBOX: VIEWBOX,
    PADDING: PADDING,
    PATTERN_IDS: PATTERN_IDS,
    formatPointAnnouncement: formatPointAnnouncement,
    buildChartModel: buildChartModel
  });
});
