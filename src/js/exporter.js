(function (root, factory) {
  'use strict';
  const exportsObj = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObj;
  }
  root.DadosSonoros = root.DadosSonoros || {};
  root.DadosSonoros.exporter = exportsObj;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeCsvField(val) {
    const str = String(val);
    if (/[",\n\r;]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function buildCsvExport(rows) {
    const lines = ['label,value'];
    const list = Array.isArray(rows) ? rows : [];
    for (let i = 0; i < list.length; i += 1) {
      lines.push(escapeCsvField(list[i].label) + ',' + list[i].value);
    }
    return lines.join('\n') + '\n';
  }

  function buildJsonExport(state, stats, exportedAt) {
    const ts = typeof exportedAt === 'string' && exportedAt ? exportedAt : new Date().toISOString();
    return JSON.stringify({
      tool: 'Dados Sonoros',
      version: 1,
      exportedAt: ts,
      title: state.title || 'Série de Dados',
      summary: stats,
      rows: state.rows
    }, null, 2) + '\n';
  }

  function buildAccessibleHtmlPackage(state, stats, chartModel) {
    const title = escapeHtml(state.title || 'Série de Dados');
    const summaryText = stats
      ? 'Pontos: ' + stats.count + ' | Mínimo: ' + stats.min.value + ' (' + escapeHtml(stats.min.label) +
        ') | Máximo: ' + stats.max.value + ' (' + escapeHtml(stats.max.label) +
        ') | Média: ' + stats.mean + ' | Mediana: ' + stats.median + ' | Tendência: ' + escapeHtml(stats.trend)
      : 'Sem dados.';

    const vb = chartModel.viewBox;
    let svgShapes = '';
    if (chartModel.chartType === 'line' && chartModel.items.length > 0) {
      const pts = chartModel.items.map(function (it) { return it.cx + ',' + it.cy; }).join(' ');
      svgShapes += '<polyline fill="none" stroke="#0E5A8A" stroke-width="3" points="' + pts + '"/>';
      for (let i = 0; i < chartModel.items.length; i += 1) {
        const it = chartModel.items[i];
        svgShapes += '<circle cx="' + it.cx + '" cy="' + it.cy + '" r="5" fill="#0E5A8A"/>';
      }
    } else {
      for (let i = 0; i < chartModel.items.length; i += 1) {
        const it = chartModel.items[i];
        svgShapes += '<rect x="' + it.barX + '" y="' + it.barY + '" width="' + it.barWidth +
          '" height="' + it.barHeight + '" fill="url(#pattern-diagonal)" stroke="#0E5A8A" stroke-width="1.5"/>';
      }
    }

    let tableRows = '';
    for (let i = 0; i < state.rows.length; i += 1) {
      const r = state.rows[i];
      const delta = i === 0 ? '—' : String(Math.round((r.value - state.rows[i - 1].value) * 100) / 100);
      tableRows += '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(r.label) + '</td><td>' +
        escapeHtml(r.value) + '</td><td>' + escapeHtml(delta) + '</td></tr>';
    }

    return [
      '<!DOCTYPE html>',
      '<html lang="pt-BR">',
      '<head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '<title>' + title + ' — Dados Sonoros</title>',
      '<style>',
      'body{font-family:system-ui,sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem;color:#0F172A;background:#FFFFFF;line-height:1.5;}',
      'h1{font-size:1.5rem;}table{width:100%;border-collapse:collapse;margin-top:1.5rem;}',
      'th,td{border:1px solid #334155;padding:0.5rem 0.75rem;text-align:left;}th{background:#EDF2F7;}',
      'svg{max-width:100%;height:auto;border:1px solid #CBD5E1;background:#F8FAFC;}',
      '</style>',
      '</head>',
      '<body>',
      '<h1>' + title + '</h1>',
      '<p>' + summaryText + '</p>',
      '<svg role="img" viewBox="0 0 ' + vb.width + ' ' + vb.height + '" aria-labelledby="t" aria-describedby="d">',
      '<title id="t">' + title + '</title>',
      '<desc id="d">' + summaryText + '</desc>',
      '<defs><pattern id="pattern-diagonal" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">',
      '<rect width="8" height="8" fill="#0E5A8A"/><line x1="0" y1="0" x2="0" y2="8" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.4"/>',
      '</pattern></defs>',
      svgShapes,
      '</svg>',
      '<table><caption>Dados da série: ' + title + '</caption><thead><tr><th scope="col">#</th><th scope="col">Rótulo</th><th scope="col">Valor</th><th scope="col">Variação</th></tr></thead><tbody>',
      tableRows,
      '</tbody></table>',
      '</body>',
      '</html>'
    ].join('\n') + '\n';
  }

  function downloadBlobFile(filename, content, mimeType) {
    if (typeof document === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
      return false;
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  return Object.freeze({
    escapeHtml: escapeHtml,
    buildCsvExport: buildCsvExport,
    buildJsonExport: buildJsonExport,
    buildAccessibleHtmlPackage: buildAccessibleHtmlPackage,
    downloadBlobFile: downloadBlobFile
  });
});
