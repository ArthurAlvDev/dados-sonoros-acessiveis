(function (root, factory) {
  'use strict';
  const exportsObj = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObj;
  }
  root.DadosSonoros = root.DadosSonoros || {};
  root.DadosSonoros.datasets = exportsObj;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAMPLE_DATASETS = Object.freeze({
    temperatura: Object.freeze({
      id: 'temperatura',
      title: 'Temperatura Média Mensal (°C)',
      chartType: 'line',
      rows: Object.freeze([
        Object.freeze({ label: 'Jan', value: 26.5 }),
        Object.freeze({ label: 'Fev', value: 27.1 }),
        Object.freeze({ label: 'Mar', value: 25.8 }),
        Object.freeze({ label: 'Abr', value: 23.4 }),
        Object.freeze({ label: 'Mai', value: 20.9 }),
        Object.freeze({ label: 'Jun', value: 19.2 })
      ])
    }),
    acessos: Object.freeze({
      id: 'acessos',
      title: 'Acessos por Trimestre (milhares)',
      chartType: 'bar',
      rows: Object.freeze([
        Object.freeze({ label: '1º Tri', value: 12 }),
        Object.freeze({ label: '2º Tri', value: 18 }),
        Object.freeze({ label: '3º Tri', value: 30 }),
        Object.freeze({ label: '4º Tri', value: 42 })
      ])
    }),
    orcamento: Object.freeze({
      id: 'orcamento',
      title: 'Orçamento Escolar por Área (R$ mil)',
      chartType: 'bar',
      rows: Object.freeze([
        Object.freeze({ label: 'Biblioteca', value: 15 }),
        Object.freeze({ label: 'Laboratórios', value: 28 }),
        Object.freeze({ label: 'Acessibilidade', value: 22 }),
        Object.freeze({ label: 'Esportes', value: 14 }),
        Object.freeze({ label: 'Tecnologia', value: 35 })
      ])
    })
  });

  function getSampleDataset(id) {
    const entry = SAMPLE_DATASETS[id];
    if (!entry) {
      return null;
    }
    return {
      id: entry.id,
      title: entry.title,
      chartType: entry.chartType,
      rows: entry.rows.map(function (r) {
        return { label: r.label, value: r.value };
      })
    };
  }

  return Object.freeze({
    SAMPLE_DATASETS: SAMPLE_DATASETS,
    getSampleDataset: getSampleDataset
  });
});
