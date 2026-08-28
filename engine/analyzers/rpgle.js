'use strict';

const fs = require('fs');

/**
 * Generic RPGLE analyzer.
 * Extracts symbols from free-format RPG IV source.
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
    const lower   = rawLine.toLowerCase().trim();

    const procMatch = lower.match(/^dcl-proc\s+(\S+)/);
    if (procMatch) {
      symbols.push({ type: 'procedure', name: procMatch[1].toUpperCase(), value: '', lineRef, rawLine });
    }

    const dclMatch = lower.match(/^(dcl-s|dcl-c)\s+(\S+)(?:.*?inz\(([^)]+)\))?/);
    if (dclMatch) {
      symbols.push({
        type : dclMatch[1] === 'dcl-c' ? 'constant' : 'variable',
        name : dclMatch[2].toUpperCase(),
        value: (dclMatch[3] || '').replace(/'/g, '').trim(),
        lineRef,
        rawLine
      });
    }

    const condMatch = lower.match(/^\s*(?:if|when)\s+(.+)/);
    if (condMatch) {
      const expr = condMatch[1];
      (expr.match(/\b\d{4,6}\b/g) || []).forEach(lit =>
        symbols.push({ type: 'condition_literal', name: lit, value: lit, lineRef, rawLine })
      );
      (expr.match(/'([^']+)'/g) || []).forEach(lit =>
        symbols.push({ type: 'condition_literal', name: lit.replace(/'/g, ''), value: lit, lineRef, rawLine })
      );
    }

    const callMatch = lower.match(/^\s*callp?\s+(?:(\w+)\/)?(\w+)/);
    if (callMatch) {
      symbols.push({ type: 'call', name: (callMatch[2] || callMatch[1] || '').toUpperCase(), value: '', lineRef, rawLine });
    }

    const commentMatch = rawLine.match(/\/\/\s*(.+)/);
    if (commentMatch) {
      symbols.push({ type: 'comment', name: 'comment', value: commentMatch[1].trim(), lineRef, rawLine });
    }
  });

  return symbols;
}

module.exports = { analyze };
