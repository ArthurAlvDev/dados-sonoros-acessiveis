(function (root) {
  'use strict';

  if (typeof document === 'undefined') {
    return;
  }

  const ns = root.DadosSonoros || {};
  const datasetsMod = ns.datasets;
  const csvParser = ns.csvParser;
  const statsMod = ns.stats;
  const sonifierMod = ns.sonifier;
  const chartModelMod = ns.chartModel;
  const storageMod = ns.storage;
  const exporterMod = ns.exporter;

  if (!datasetsMod || !csvParser || !statsMod || !sonifierMod || !chartModelMod || !storageMod || !exporterMod) {
    return;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function getSafeLocalStorage() {
    try {
      return root.localStorage;
    } catch (_err) {
      return null;
    }
  }

  let appState = storageMod.createDefaultState();
  let activeIndex = 0;
  let volumePercent = 70;
  let audioAvailable = sonifierMod.isWebAudioSupported();
  const audioEngine = sonifierMod.createAudioEngine();

  const els = {
    btnThemeDefault: document.getElementById('btn-theme-default'),
    btnThemeHc: document.getElementById('btn-theme-hc'),
    sampleSelect: document.getElementById('sample-select'),
    storageWarning: document.getElementById('storage-warning'),
    audioWarning: document.getElementById('audio-warning'),
    constantWarning: document.getElementById('constant-warning'),
    chartTitleInput: document.getElementById('chart-title-input'),
    csvFileInput: document.getElementById('csv-file-input'),
    csvInput: document.getElementById('csv-input'),
    csvError: document.getElementById('csv-error'),
    btnApplyCsv: document.getElementById('btn-apply-csv'),
    btnResetData: document.getElementById('btn-reset-data'),
    editableRows: document.getElementById('editable-rows'),
    btnAddRow: document.getElementById('btn-add-row'),
    emptyState: document.getElementById('empty-state'),
    emptySampleButtons: document.getElementById('empty-sample-buttons'),
    statsGrid: document.getElementById('stats-grid'),
    btnChartBar: document.getElementById('btn-chart-bar'),
    btnChartLine: document.getElementById('btn-chart-line'),
    btnScaleLinear: document.getElementById('btn-scale-linear'),
    btnScaleLog: document.getElementById('btn-scale-log'),
    playbackRate: document.getElementById('playback-rate'),
    volumeRange: document.getElementById('volume-range'),
    volumeVal: document.getElementById('volume-val'),
    scaleNote: document.getElementById('scale-note'),
    btnPlay: document.getElementById('btn-play'),
    btnPause: document.getElementById('btn-pause'),
    btnStop: document.getElementById('btn-stop'),
    btnRefTones: document.getElementById('btn-ref-tones'),
    btnPrevPoint: document.getElementById('btn-prev-point'),
    btnNextPoint: document.getElementById('btn-next-point'),
    chartExplorer: document.getElementById('chart-explorer'),
    pointLiveRegion: document.getElementById('point-live-region'),
    tableCaption: document.getElementById('table-caption'),
    dataTableBody: document.getElementById('data-table-body'),
    btnExportHtml: document.getElementById('btn-export-html'),
    btnExportJson: document.getElementById('btn-export-json'),
    btnExportCsv: document.getElementById('btn-export-csv')
  };

  function clearChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function showBanner(el, msg) {
    if (!msg) {
      el.textContent = '';
      el.hidden = true;
      return;
    }
    el.textContent = msg;
    el.hidden = false;
  }

  function saveAndSync() {
    const res = storageMod.saveState(appState, getSafeLocalStorage());
    appState = res.state;
    showBanner(els.storageWarning, res.warning);
    renderAll();
  }

  function applyThemeAndControls() {
    const isHc = appState.theme === 'high-contrast';
    document.documentElement.setAttribute('data-theme', isHc ? 'alto-contraste' : 'claro');
    els.btnThemeDefault.setAttribute('aria-pressed', isHc ? 'false' : 'true');
    els.btnThemeHc.setAttribute('aria-pressed', isHc ? 'true' : 'false');

    els.btnChartBar.setAttribute('aria-pressed', appState.chartType === 'bar' ? 'true' : 'false');
    els.btnChartLine.setAttribute('aria-pressed', appState.chartType === 'line' ? 'true' : 'false');

    els.btnScaleLinear.setAttribute('aria-pressed', appState.audioScale === 'linear' ? 'true' : 'false');
    els.btnScaleLog.setAttribute('aria-pressed', appState.audioScale === 'log' ? 'true' : 'false');

    els.playbackRate.value = String(appState.playbackRate);
    if (els.chartTitleInput.value !== appState.title) {
      els.chartTitleInput.value = appState.title;
    }
  }

  function updateAudioButtonsState() {
    const hasRows = appState.rows.length >= 2;
    const canPlay = audioAvailable && hasRows;
    els.btnPlay.disabled = !canPlay;
    els.btnPause.disabled = !canPlay;
    els.btnStop.disabled = !canPlay;
    els.btnRefTones.disabled = !canPlay;
    els.btnPrevPoint.disabled = !hasRows;
    els.btnNextPoint.disabled = !hasRows;
    els.btnExportHtml.disabled = !hasRows;
    els.btnExportJson.disabled = !hasRows;
    els.btnExportCsv.disabled = !hasRows;

    if (!audioAvailable) {
      showBanner(
        els.audioWarning,
        'Áudio da Web Audio API indisponível neste navegador. A exploração por teclado, leitor de tela, gráfico SVG e tabela continuam 100% disponíveis.'
      );
    } else {
      showBanner(els.audioWarning, null);
    }
  }

  function syncCsvTextareaFromRows() {
    const lines = ['label,value'];
    for (let i = 0; i < appState.rows.length; i += 1) {
      lines.push(appState.rows[i].label + ',' + appState.rows[i].value);
    }
    els.csvInput.value = lines.join('\n');
  }

  function renderEditableRows() {
    clearChildren(els.editableRows);
    for (let i = 0; i < appState.rows.length; i += 1) {
      const idx = i;
      const row = appState.rows[i];

      const rowDiv = document.createElement('div');
      rowDiv.className = 'editable-row';

      const labelInput = document.createElement('input');
      labelInput.setAttribute('type', 'text');
      labelInput.setAttribute('maxlength', String(csvParser.MAX_LABEL_LENGTH));
      labelInput.setAttribute('aria-label', 'Rótulo da linha ' + (idx + 1));
      labelInput.value = row.label;
      labelInput.addEventListener('change', function (e) {
        const clean = e.target.value.trim().slice(0, csvParser.MAX_LABEL_LENGTH);
        if (!clean) {
          e.target.value = appState.rows[idx].label;
          return;
        }
        appState.rows[idx].label = clean;
        syncCsvTextareaFromRows();
        saveAndSync();
      });

      const valInput = document.createElement('input');
      valInput.setAttribute('type', 'number');
      valInput.setAttribute('step', 'any');
      valInput.setAttribute('aria-label', 'Valor da linha ' + (idx + 1));
      valInput.value = String(row.value);
      valInput.addEventListener('change', function (e) {
        const num = Number(e.target.value);
        if (!Number.isFinite(num)) {
          e.target.value = String(appState.rows[idx].value);
          return;
        }
        appState.rows[idx].value = num;
        syncCsvTextareaFromRows();
        saveAndSync();
      });

      const removeBtn = document.createElement('button');
      removeBtn.setAttribute('type', 'button');
      removeBtn.className = 'btn-compact';
      removeBtn.setAttribute('aria-label', 'Remover linha ' + (idx + 1));
      removeBtn.textContent = 'Remover';
      removeBtn.disabled = appState.rows.length <= 2;
      removeBtn.addEventListener('click', function () {
        if (appState.rows.length <= 2) {
          return;
        }
        appState.rows.splice(idx, 1);
        if (activeIndex >= appState.rows.length) {
          activeIndex = appState.rows.length - 1;
        }
        syncCsvTextareaFromRows();
        saveAndSync();
      });

      rowDiv.appendChild(labelInput);
      rowDiv.appendChild(valInput);
      rowDiv.appendChild(removeBtn);
      els.editableRows.appendChild(rowDiv);
    }
  }

  function renderStats(stats) {
    clearChildren(els.statsGrid);
    if (!stats) {
      return;
    }

    const cards = [
      { label: 'Pontos', value: String(stats.count) },
      { label: 'Mínimo', value: stats.min.value + ' (' + stats.min.label + ')' },
      { label: 'Máximo', value: stats.max.value + ' (' + stats.max.label + ')' },
      { label: 'Média', value: String(stats.mean) },
      { label: 'Mediana', value: String(stats.median) },
      {
        label: 'Tendência',
        value: stats.trend + (stats.changePct !== null ? ' (' + (stats.changePct > 0 ? '+' : '') + stats.changePct + '%)' : '')
      }
    ];

    for (let i = 0; i < cards.length; i += 1) {
      const card = document.createElement('div');
      card.className = 'stat-card';
      const lbl = document.createElement('span');
      lbl.className = 'stat-label';
      lbl.textContent = cards[i].label;
      const val = document.createElement('span');
      val.className = 'stat-value';
      val.textContent = cards[i].value;
      card.appendChild(lbl);
      card.appendChild(val);
      els.statsGrid.appendChild(card);
    }

    if (stats.min.value === stats.max.value) {
      showBanner(els.constantWarning, 'Todos os valores são iguais: a sonificação utiliza frequência fixa de 440 Hz.');
    } else {
      showBanner(els.constantWarning, null);
    }

    if (appState.audioScale === 'log' && stats.min.value <= 0) {
      els.scaleNote.textContent = 'Há valores menores ou iguais a zero; escala linear aplicada automaticamente como fallback.';
      els.scaleNote.hidden = false;
    } else {
      els.scaleNote.textContent = '';
      els.scaleNote.hidden = true;
    }
  }

  function createSvgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      const keys = Object.keys(attrs);
      for (let i = 0; i < keys.length; i += 1) {
        el.setAttribute(keys[i], String(attrs[keys[i]]));
      }
    }
    return el;
  }

  function renderChart(stats) {
    clearChildren(els.chartExplorer);
    if (appState.rows.length < 2) {
      return;
    }

    const model = chartModelMod.buildChartModel(appState.rows, appState.chartType, {
      activeIndex: activeIndex
    });

    const svg = createSvgEl('svg', {
      role: 'img',
      viewBox: '0 0 ' + model.viewBox.width + ' ' + model.viewBox.height,
      'aria-labelledby': 'chart-svg-title',
      'aria-describedby': 'chart-svg-desc'
    });

    const titleEl = createSvgEl('title', { id: 'chart-svg-title' });
    titleEl.textContent = appState.title || 'Gráfico de Dados';
    const descEl = createSvgEl('desc', { id: 'chart-svg-desc' });
    descEl.textContent = stats
      ? 'Série com ' + stats.count + ' pontos. Mínimo ' + stats.min.value + ', máximo ' + stats.max.value + ', tendência ' + stats.trend + '.'
      : 'Gráfico acessível.';

    const defs = createSvgEl('defs');

    const patDiag = createSvgEl('pattern', {
      id: model.patternIds.series1,
      width: '8',
      height: '8',
      patternUnits: 'userSpaceOnUse',
      patternTransform: 'rotate(45)'
    });
    patDiag.appendChild(createSvgEl('rect', { width: '8', height: '8', fill: 'var(--chart-series-1)' }));
    patDiag.appendChild(createSvgEl('line', {
      x1: '0', y1: '0', x2: '0', y2: '8',
      stroke: 'var(--bg-surface)', 'stroke-width': '2', 'stroke-opacity': '0.35'
    }));

    const patDots = createSvgEl('pattern', {
      id: model.patternIds.active,
      width: '8',
      height: '8',
      patternUnits: 'userSpaceOnUse'
    });
    patDots.appendChild(createSvgEl('rect', { width: '8', height: '8', fill: 'var(--chart-active)' }));
    patDots.appendChild(createSvgEl('circle', { cx: '4', cy: '4', r: '1.6', fill: 'var(--bg-surface)' }));

    defs.appendChild(patDiag);
    defs.appendChild(patDots);
    svg.appendChild(titleEl);
    svg.appendChild(descEl);
    svg.appendChild(defs);

    // Grid and Y ticks
    for (let t = 0; t < model.ticks.length; t += 1) {
      const tick = model.ticks[t];
      svg.appendChild(createSvgEl('line', {
        x1: model.padding.left,
        y1: tick.y,
        x2: model.viewBox.width - model.padding.right,
        y2: tick.y,
        stroke: 'var(--chart-grid)',
        'stroke-dasharray': '4 4'
      }));
      const lbl = createSvgEl('text', {
        x: model.padding.left - 8,
        y: tick.y + 4,
        'text-anchor': 'end',
        fill: 'var(--chart-axis)',
        'font-size': '12'
      });
      lbl.textContent = String(tick.value);
      svg.appendChild(lbl);
    }

    // Axes
    svg.appendChild(createSvgEl('line', {
      x1: model.padding.left,
      y1: model.padding.top,
      x2: model.padding.left,
      y2: model.viewBox.height - model.padding.bottom,
      stroke: 'var(--chart-axis)',
      'stroke-width': '1.5'
    }));
    svg.appendChild(createSvgEl('line', {
      x1: model.padding.left,
      y1: model.viewBox.height - model.padding.bottom,
      x2: model.viewBox.width - model.padding.right,
      y2: model.viewBox.height - model.padding.bottom,
      stroke: 'var(--chart-axis)',
      'stroke-width': '1.5'
    }));

    if (model.chartType === 'line' && model.items.length > 0) {
      const pointsStr = model.items.map(function (it) { return it.cx + ',' + it.cy; }).join(' ');
      svg.appendChild(createSvgEl('polyline', {
        fill: 'none',
        stroke: 'var(--chart-series-1)',
        'stroke-width': '3',
        points: pointsStr
      }));
    }

    for (let i = 0; i < model.items.length; i += 1) {
      const it = model.items[i];
      const idx = i;

      if (model.chartType === 'bar') {
        const bar = createSvgEl('rect', {
          x: it.barX,
          y: it.barY,
          width: it.barWidth,
          height: it.barHeight,
          fill: 'url(#' + it.patternId + ')',
          stroke: it.isActive ? 'var(--chart-active)' : 'var(--chart-series-1)',
          'stroke-width': it.isActive ? '3' : '1.5',
          style: 'cursor:pointer;'
        });
        bar.addEventListener('click', function () {
          selectPoint(idx, true);
        });
        svg.appendChild(bar);
      } else {
        if (it.isActive) {
          svg.appendChild(createSvgEl('line', {
            x1: it.cx,
            y1: it.cy,
            x2: it.cx,
            y2: model.viewBox.height - model.padding.bottom,
            stroke: 'var(--chart-active)',
            'stroke-dasharray': '4 3',
            'stroke-width': '1.5'
          }));
        }
        const dot = createSvgEl('circle', {
          cx: it.cx,
          cy: it.cy,
          r: it.isActive ? '8' : '5',
          fill: it.isActive ? 'var(--chart-active)' : 'var(--chart-series-1)',
          stroke: 'var(--bg-surface)',
          'stroke-width': '2.5',
          style: 'cursor:pointer;'
        });
        dot.addEventListener('click', function () {
          selectPoint(idx, true);
        });
        svg.appendChild(dot);
      }

      if (it.isActive) {
        const valText = createSvgEl('text', {
          x: it.cx,
          y: Math.max(16, (model.chartType === 'bar' ? it.barY : it.cy) - 10),
          'text-anchor': 'middle',
          fill: 'var(--text-primary)',
          'font-size': '13',
          'font-weight': 'bold'
        });
        valText.textContent = String(it.value);
        svg.appendChild(valText);
      }

      const xLbl = createSvgEl('text', {
        x: it.cx,
        y: model.viewBox.height - model.padding.bottom + 20,
        'text-anchor': 'middle',
        fill: 'var(--chart-axis)',
        'font-size': '12'
      });
      xLbl.textContent = it.label.length > 10 ? it.label.slice(0, 9) + '…' : it.label;
      svg.appendChild(xLbl);
    }

    els.chartExplorer.appendChild(svg);
  }

  function renderTable() {
    els.tableCaption.textContent = 'Dados da série: ' + (appState.title || 'Série de Dados');
    clearChildren(els.dataTableBody);

    for (let i = 0; i < appState.rows.length; i += 1) {
      const idx = i;
      const row = appState.rows[i];
      const tr = document.createElement('tr');
      if (i === activeIndex) {
        tr.className = 'is-active';
        tr.setAttribute('aria-current', 'true');
      }
      tr.addEventListener('click', function () {
        selectPoint(idx, true);
      });

      const tdIdx = document.createElement('td');
      tdIdx.textContent = String(i + 1);

      const tdLabel = document.createElement('td');
      tdLabel.textContent = row.label;

      const tdVal = document.createElement('td');
      tdVal.textContent = String(row.value);

      const tdDelta = document.createElement('td');
      if (i === 0) {
        tdDelta.textContent = '—';
      } else {
        const delta = Math.round((row.value - appState.rows[i - 1].value) * 100) / 100;
        tdDelta.textContent = (delta > 0 ? '+' : '') + delta;
      }

      tr.appendChild(tdIdx);
      tr.appendChild(tdLabel);
      tr.appendChild(tdVal);
      tr.appendChild(tdDelta);
      els.dataTableBody.appendChild(tr);
    }
  }

  function announceActivePoint() {
    els.pointLiveRegion.textContent = chartModelMod.formatPointAnnouncement(appState.rows, activeIndex);
  }

  function playSinglePoint(index) {
    if (!audioAvailable || appState.rows.length < 2) {
      return;
    }
    const stats = statsMod.computeStats(appState.rows);
    const mapped = sonifierMod.mapValueToFrequency(
      appState.rows[index].value,
      stats.min.value,
      stats.max.value,
      { scale: appState.audioScale }
    );
    const res = audioEngine.playTone(mapped.frequency, 0.18, volumePercent / 100);
    if (!res.supported) {
      audioAvailable = false;
      updateAudioButtonsState();
    }
  }

  function selectPoint(index, shouldSpeakTone) {
    if (appState.rows.length === 0) {
      return;
    }
    activeIndex = Math.min(appState.rows.length - 1, Math.max(0, index));
    const stats = statsMod.computeStats(appState.rows);
    renderChart(stats);
    renderTable();
    announceActivePoint();
    if (shouldSpeakTone) {
      playSinglePoint(activeIndex);
    }
  }

  function renderAll() {
    const hasRows = appState.rows.length >= 2;
    els.emptyState.hidden = hasRows;
    applyThemeAndControls();
    updateAudioButtonsState();
    renderEditableRows();

    const stats = statsMod.computeStats(appState.rows);
    renderStats(stats);
    renderChart(stats);
    renderTable();
    announceActivePoint();
  }

  function loadSample(id) {
    const sample = datasetsMod.getSampleDataset(id);
    if (!sample) {
      return;
    }
    audioEngine.stop();
    appState.title = sample.title;
    appState.chartType = sample.chartType;
    appState.rows = sample.rows;
    activeIndex = 0;
    showBanner(els.csvError, null);
    syncCsvTextareaFromRows();
    saveAndSync();
  }

  function renderEmptySampleButtons() {
    clearChildren(els.emptySampleButtons);
    const keys = Object.keys(datasetsMod.SAMPLE_DATASETS);
    for (let i = 0; i < keys.length; i += 1) {
      const ds = datasetsMod.SAMPLE_DATASETS[keys[i]];
      const btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.className = 'btn-control';
      btn.textContent = ds.title;
      btn.addEventListener('click', function () {
        loadSample(ds.id);
      });
      els.emptySampleButtons.appendChild(btn);
    }
  }

  function bindEvents() {
    els.btnThemeDefault.addEventListener('click', function () {
      appState.theme = 'default';
      saveAndSync();
    });

    els.btnThemeHc.addEventListener('click', function () {
      appState.theme = 'high-contrast';
      saveAndSync();
    });

    els.sampleSelect.addEventListener('change', function (e) {
      if (e.target.value) {
        loadSample(e.target.value);
        e.target.value = '';
      }
    });

    els.chartTitleInput.addEventListener('input', function (e) {
      appState.title = e.target.value.slice(0, 120);
      saveAndSync();
    });

    els.btnApplyCsv.addEventListener('click', function () {
      const parsed = csvParser.parseCsv(els.csvInput.value);
      if (!parsed.ok) {
        showBanner(els.csvError, parsed.error);
        return;
      }
      showBanner(els.csvError, null);
      audioEngine.stop();
      appState.rows = parsed.rows;
      activeIndex = 0;
      saveAndSync();
    });

    els.csvFileInput.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        return;
      }
      if (file.size > csvParser.MAX_FILE_BYTES) {
        showBanner(els.csvError, 'Arquivo excede o limite máximo de 512 KB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = function (ev) {
        const text = String(ev.target && ev.target.result ? ev.target.result : '');
        els.csvInput.value = text;
        const parsed = csvParser.parseCsv(text);
        if (!parsed.ok) {
          showBanner(els.csvError, parsed.error);
          return;
        }
        showBanner(els.csvError, null);
        appState.rows = parsed.rows;
        activeIndex = 0;
        saveAndSync();
      };
      reader.readAsText(file, 'UTF-8');
    });

    els.btnAddRow.addEventListener('click', function () {
      if (appState.rows.length >= csvParser.MAX_ROWS) {
        return;
      }
      appState.rows.push({ label: 'Item ' + (appState.rows.length + 1), value: 0 });
      syncCsvTextareaFromRows();
      saveAndSync();
    });

    els.btnResetData.addEventListener('click', function () {
      if (!root.confirm('Restaurar os dados e preferências padrão?')) {
        return;
      }
      audioEngine.stop();
      const res = storageMod.clearState(getSafeLocalStorage());
      appState = res.state;
      activeIndex = 0;
      showBanner(els.storageWarning, res.warning);
      showBanner(els.csvError, null);
      syncCsvTextareaFromRows();
      renderAll();
    });

    els.btnChartBar.addEventListener('click', function () {
      appState.chartType = 'bar';
      saveAndSync();
    });

    els.btnChartLine.addEventListener('click', function () {
      appState.chartType = 'line';
      saveAndSync();
    });

    els.btnScaleLinear.addEventListener('click', function () {
      appState.audioScale = 'linear';
      saveAndSync();
    });

    els.btnScaleLog.addEventListener('click', function () {
      appState.audioScale = 'log';
      saveAndSync();
    });

    els.playbackRate.addEventListener('change', function (e) {
      appState.playbackRate = Number(e.target.value);
      saveAndSync();
    });

    els.volumeRange.addEventListener('input', function (e) {
      volumePercent = Number(e.target.value);
      els.volumeVal.textContent = volumePercent + '%';
    });

    els.btnPlay.addEventListener('click', function () {
      const stats = statsMod.computeStats(appState.rows);
      if (!stats) {
        return;
      }
      const res = audioEngine.playSeries(
        appState.rows,
        {
          minVal: stats.min.value,
          maxVal: stats.max.value,
          scale: appState.audioScale,
          playbackRate: appState.playbackRate,
          volume: volumePercent / 100
        },
        function (idx) {
          selectPoint(idx, false);
        }
      );
      if (!res.supported) {
        audioAvailable = false;
        updateAudioButtonsState();
      }
    });

    els.btnPause.addEventListener('click', function () {
      audioEngine.pause();
    });

    els.btnStop.addEventListener('click', function () {
      audioEngine.stop();
    });

    els.btnRefTones.addEventListener('click', function () {
      const stats = statsMod.computeStats(appState.rows);
      if (!stats) {
        return;
      }
      const res = audioEngine.playReferenceMinMax(stats.min.value, stats.max.value, {
        scale: appState.audioScale,
        volume: volumePercent / 100
      });
      if (!res.supported) {
        audioAvailable = false;
        updateAudioButtonsState();
      }
    });

    els.btnPrevPoint.addEventListener('click', function () {
      selectPoint(activeIndex - 1, true);
    });

    els.btnNextPoint.addEventListener('click', function () {
      selectPoint(activeIndex + 1, true);
    });

    els.chartExplorer.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectPoint(activeIndex + 1, true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectPoint(activeIndex - 1, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        selectPoint(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        selectPoint(appState.rows.length - 1, true);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playSinglePoint(activeIndex);
      }
    });

    els.btnExportHtml.addEventListener('click', function () {
      const stats = statsMod.computeStats(appState.rows);
      const model = chartModelMod.buildChartModel(appState.rows, appState.chartType, {
        activeIndex: activeIndex
      });
      const html = exporterMod.buildAccessibleHtmlPackage(appState, stats, model);
      exporterMod.downloadBlobFile('dados-sonoros-grafico.html', html, 'text/html;charset=utf-8');
    });

    els.btnExportJson.addEventListener('click', function () {
      const stats = statsMod.computeStats(appState.rows);
      const json = exporterMod.buildJsonExport(appState, stats);
      exporterMod.downloadBlobFile('dados-sonoros.json', json, 'application/json;charset=utf-8');
    });

    els.btnExportCsv.addEventListener('click', function () {
      const csv = exporterMod.buildCsvExport(appState.rows);
      exporterMod.downloadBlobFile('dados-sonoros.csv', csv, 'text/csv;charset=utf-8');
    });
  }

  function init() {
    const loaded = storageMod.loadState(getSafeLocalStorage());
    appState = loaded.state;
    showBanner(els.storageWarning, loaded.warning);
    syncCsvTextareaFromRows();
    renderEmptySampleButtons();
    bindEvents();
    renderAll();
  }

  init();
})(typeof globalThis !== 'undefined' ? globalThis : this);
