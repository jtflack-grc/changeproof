'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Generic DDS physical file analyzer.
 * Parses fixed-column DDS source layout.
 *
 * Standard DDS column positions (1-based):
 *   Col 6   : Form type (A = field specification)
 *   Col 19-28 : Name (field or record format)
 *   Col 30-34 : Length
 *   Col 35   : Data type
 *   Col 45+  : Functions / TEXT keyword
 *
 * @param {string} filePath
 * @returns {Array<{type,name,value,lineRef,rawLine}>}
 */
function analyze(filePath) {
  const lines   = fs.readFileSync(filePath, 'utf8').split('\n');
  const symbols = [];
  const rel     = filePath.replace(/\\/g, '/');
  const fileName = path.basename(filePath, path.extname(filePath)).toUpperCase();

  symbols.push({ type: 'file', name: fileName, value: '', lineRef: `${rel}:1`, rawLine: '' });

  lines.forEach((rawLine, i) => {
    const lineRef = `${rel}:${i + 1}`;
    if (!rawLine.trim() || rawLine.trim().startsWith('*')) return;

    const formType = rawLine.length > 5 ? rawLine[5].trim() : '';
    if (formType !== 'A' && formType !== '') return;

    const namePart = rawLine.length > 18 ? rawLine.slice(18, 28).trim() : '';
    if (!namePart) return;

    const lenPart  = rawLine.length > 29 ? rawLine.slice(29, 34).trim() : '';
    const typePart = rawLine.length > 34 ? rawLine[34].trim() : '';
    const funcPart = rawLine.length > 44 ? rawLine.slice(44).trim() : '';

    const textMatch = funcPart.match(/TEXT\('([^']+)'\)/i);
    const fieldText = textMatch ? textMatch[1] : funcPart;

    if (namePart.startsWith('R')) {
      symbols.push({ type: 'record_format', name: namePart, value: fieldText, lineRef, rawLine });
    } else if (/^[A-Z]/.test(namePart)) {
      symbols.push({
        type: 'field', name: namePart, value: fieldText, lineRef, rawLine,
        meta: { length: lenPart, dataType: typePart }
      });
    }
  });

  return symbols;
}

module.exports = { analyze };
