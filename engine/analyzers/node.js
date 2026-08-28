'use strict';

const fs = require('fs');

/**
 * Generic Node.js / JavaScript analyzer.
 * Extracts variable assignments with literals, TODO/FIXME comments,
 * route declarations, require targets, and function names.
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
    const trimmed = rawLine.trim();

    const numAssign = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\d+)/);
    if (numAssign) {
      symbols.push({ type: 'numeric_literal', name: numAssign[1], value: numAssign[2], lineRef, rawLine });
    }

    const strAssign = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*['"`]([^'"`]+)['"`]/);
    if (strAssign) {
      symbols.push({ type: 'string_literal', name: strAssign[1], value: strAssign[2], lineRef, rawLine });
    }

    const todoMatch = trimmed.match(/\/\/\s*(TODO|FIXME)[:\s]+(.+)/i);
    if (todoMatch) {
      symbols.push({ type: 'todo_comment', name: todoMatch[1].toUpperCase(), value: todoMatch[2].trim(), lineRef, rawLine });
    }

    const routeMatch = trimmed.match(/(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/i);
    if (routeMatch) {
      symbols.push({ type: 'route', name: `${routeMatch[1].toUpperCase()} ${routeMatch[2]}`, value: '', lineRef, rawLine });
    }

    const requireMatch = trimmed.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
    if (requireMatch) {
      symbols.push({ type: 'require', name: requireMatch[1], value: '', lineRef, rawLine });
    }

    const fnMatch = trimmed.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\()/);
    if (fnMatch) {
      const name = fnMatch[1] || fnMatch[2];
      if (name) symbols.push({ type: 'function', name, value: '', lineRef, rawLine });
    }
  });

  return symbols;
}

module.exports = { analyze };
