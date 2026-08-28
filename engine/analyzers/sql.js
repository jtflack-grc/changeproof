'use strict';

const fs = require('fs');

/**
 * Generic SQL analyzer (Db2 for i DDL + SQLite surrogate).
 * Extracts table names, columns, LABEL ON values, CHECK constraints,
 * and inline comments.
 * Returns RawSymbol[] — no change-request-specific rules.
 *
 * @param {string} filePath
 * @returns {Array<{type,name,value,lineRef,rawLine}>}
 */
function analyze(filePath) {
  const lines   = fs.readFileSync(filePath, 'utf8').split('\n');
  const symbols = [];
  const rel     = filePath.replace(/\\/g, '/');

  lines.forEach((rawLine, i) => {
    const lineRef = `${rel}:${i + 1}`;
    const upper   = rawLine.trim().toUpperCase();

    const createMatch = upper.match(/CREATE\s+TABLE\s+(?:\S+\/)?([A-Z_][A-Z0-9_]*)/);
    if (createMatch) {
      symbols.push({ type: 'table', name: createMatch[1], value: '', lineRef, rawLine });
    }

    const colMatch = rawLine.match(/^\s{2,}([A-Z_][A-Z0-9_]{1,9})\s+(CHAR|DECIMAL|INTEGER|TEXT|REAL|NUMERIC|VARCHAR)/i);
    if (colMatch) {
      symbols.push({ type: 'column', name: colMatch[1].toUpperCase(), value: colMatch[2].toUpperCase(), lineRef, rawLine });
    }

    const labelMatch = rawLine.match(/([A-Z_][A-Z0-9_]*)\s+TEXT IS '([^']+)'/i);
    if (labelMatch) {
      symbols.push({ type: 'label', name: labelMatch[1].toUpperCase(), value: labelMatch[2], lineRef, rawLine });
    }

    const checkMatch = upper.match(/CHECK\s*\((.+)\)/);
    if (checkMatch) {
      symbols.push({ type: 'constraint', name: 'CHECK', value: checkMatch[1].trim(), lineRef, rawLine });
    }

    const commentMatch = rawLine.match(/--\s*(.+)/);
    if (commentMatch) {
      symbols.push({ type: 'comment', name: 'comment', value: commentMatch[1].trim(), lineRef, rawLine });
    }
  });

  return symbols;
}

module.exports = { analyze };
