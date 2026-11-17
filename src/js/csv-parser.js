(function (root, factory) {
  'use strict';
  const exportsObj = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = exportsObj;
  }
  root.DadosSonoros = root.DadosSonoros || {};
  root.DadosSonoros.csvParser = exportsObj;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_ROWS = 500;
  const MAX_FILE_BYTES = 512 * 1024;
  const MAX_LABEL_LENGTH = 80;

  function detectDelimiter(firstLine) {
    const counts = {
      ';': (firstLine.match(/;/g) || []).length,
      '\t': (firstLine.match(/\t/g) || []).length,
      ',': (firstLine.match(/,/g) || []).length
    };
    if (counts['\t'] > 0 && counts['\t'] >= counts[';'] && counts['\t'] >= counts[',']) {
      return '\t';
    }
    if (counts[';'] > 0 && counts[';'] >= counts[',']) {
      return ';';
    }
    return ',';
  }

  function parseCsvLine(line, delimiter) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  function parseNumericValue(rawVal, delimiter) {
    if (typeof rawVal !== 'string') {
      return NaN;
    }
    let cleaned = rawVal.trim();
    if (!cleaned) {
      return NaN;
    }
    if (delimiter === ';' || delimiter === '\t') {
      cleaned = cleaned.replace(',', '.');
    }
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : NaN;
  }

  function parseCsv(rawText) {
    if (typeof rawText !== 'string' || !rawText.trim()) {
      return { ok: false, error: 'Nenhum dado informado. Cole um CSV/TSV com pelo menos 2 pontos.', line: 1 };
    }

    const rawLines = rawText.replace(/\r\n?/g, '\n').split('\n');
    const nonEmpty = [];
    for (let i = 0; i < rawLines.length; i += 1) {
      if (rawLines[i].trim() !== '') {
        nonEmpty.push({ text: rawLines[i], lineNumber: i + 1 });
      }
    }

    if (nonEmpty.length === 0) {
      return { ok: false, error: 'Nenhum dado válido encontrado.', line: 1 };
    }

    const delimiter = detectDelimiter(nonEmpty[0].text);
    const rows = [];

    for (let i = 0; i < nonEmpty.length; i += 1) {
      const entry = nonEmpty[i];
      const fields = parseCsvLine(entry.text, delimiter);
      if (fields.length < 2) {
        return {
          ok: false,
          error: 'Linha ' + entry.lineNumber + ': esperadas pelo menos 2 colunas (rótulo e valor).',
          line: entry.lineNumber
        };
      }

      const label = fields[0].slice(0, MAX_LABEL_LENGTH).trim();
      const numVal = parseNumericValue(fields[1], delimiter);

      if (i === 0 && !Number.isFinite(numVal)) {
        // Optional header row
        continue;
      }

      if (!label) {
        return {
          ok: false,
          error: 'Linha ' + entry.lineNumber + ': rótulo vazio.',
          line: entry.lineNumber
        };
      }

      if (!Number.isFinite(numVal)) {
        return {
          ok: false,
          error: 'Linha ' + entry.lineNumber + ': valor "' + fields[1] + '" não é um número válido.',
          line: entry.lineNumber
        };
      }

      rows.push({ label: label, value: numVal });
      if (rows.length > MAX_ROWS) {
        return {
          ok: false,
          error: 'Limite máximo de ' + MAX_ROWS + ' linhas de dados excedido.',
          line: entry.lineNumber
        };
      }
    }

    if (rows.length < 2) {
      return {
        ok: false,
        error: 'São necessários pelo menos 2 pontos numéricos válidos.',
        line: nonEmpty[nonEmpty.length - 1].lineNumber
      };
    }

    return { ok: true, rows: rows, delimiter: delimiter };
  }

  return Object.freeze({
    MAX_ROWS: MAX_ROWS,
    MAX_FILE_BYTES: MAX_FILE_BYTES,
    MAX_LABEL_LENGTH: MAX_LABEL_LENGTH,
    detectDelimiter: detectDelimiter,
    parseCsvLine: parseCsvLine,
    parseCsv: parseCsv
  });
});
