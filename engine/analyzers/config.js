'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Generic configuration analyzer for simple JSON, INI/env/conf and YAML-style
 * configuration files. It extracts scalar key/value pairs only. The analyzer
 * deliberately does not attempt to interpret product-specific semantics.
 *
 * Returns RawSymbol[] compatible with the ChangeProof evidence core.
 */
function analyze(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const symbols = [];

  const push = (type, name, value, lineNumber, rawLine) => {
    symbols.push({
      type,
      name: String(name),
      value: String(value),
      lineRef: `${filePath.replace(/\\/g, '/')}:${lineNumber}`,
      rawLine
    });
  };

  if (ext === '.json') {
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { return symbols; }

    const flatten = (value, prefix = '') => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
        return;
      }
      if (['string', 'number', 'boolean'].includes(typeof value)) {
        const leaf = prefix.split('.').pop();
        const needle = `"${leaf}"`;
        const idx = lines.findIndex(line => line.includes(needle));
        push('config_value', prefix, value, idx >= 0 ? idx + 1 : 1, idx >= 0 ? lines[idx] : `${prefix}=${value}`);
      }
    };

    flatten(parsed);
    return symbols;
  }

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';') || trimmed.startsWith('//')) return;

    // KEY=value, key: value, or directive value.
    let match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*([^#;]+?)\s*$/);
    if (!match) match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_.-]*)\s*:\s*([^#]+?)\s*$/);
    if (!match) match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_.-]*)\s+([0-9]+(?:\.[0-9]+)?(?:ms|s|m|h)?)\s*;?\s*$/i);
    if (!match) return;

    const rawValue = match[2].trim().replace(/^['"]|['"]$/g, '');
    push('config_value', match[1], rawValue, index + 1, rawLine);
  });

  return symbols;
}

module.exports = { analyze };
