'use strict';

const fs = require('fs');

/**
 * Generic Markdown / plain-text documentation analyzer.
 * Extracts headings, time expressions, list items, and sentence context.
 * Each symbol carries a `headingContext` property so the collector can
 * associate findings with document sections.
 * Returns RawSymbol[] — no change-request-specific rules.
 *
 * @param {string} filePath
 * @returns {Array<{type,name,value,lineRef,rawLine,headingContext}>}
 */
function analyze(filePath) {
  const lines        = fs.readFileSync(filePath, 'utf8').split('\n');
  const symbols      = [];
  const rel          = filePath.replace(/\\/g, '/');
  let currentHeading = '(preamble)';

  const TIME_RE = /\b(\d{1,2}:\d{2}\s*(?:AM|PM)?|\d{4})\b/gi;

  lines.forEach((rawLine, i) => {
    const lineRef = `${rel}:${i + 1}`;
    const trimmed = rawLine.trim();

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      currentHeading = headingMatch[2].trim();
      symbols.push({ type: 'heading', name: currentHeading, value: headingMatch[1], lineRef, rawLine, headingContext: currentHeading });
      return;
    }

    const timeMatches = [...rawLine.matchAll(TIME_RE)];
    timeMatches.forEach(m => {
      symbols.push({ type: 'time_expression', name: m[1], value: m[1], lineRef, rawLine, headingContext: currentHeading });
    });

    if (/^\s*[-*|]/.test(trimmed) && trimmed.length > 2) {
      symbols.push({
        type: 'list_item',
        name: trimmed.replace(/^[-*|]\s*/, '').substring(0, 80),
        value: trimmed,
        lineRef,
        rawLine,
        headingContext: currentHeading
      });
    }

    if (trimmed.length > 10 && !headingMatch) {
      symbols.push({
        type: 'sentence',
        name: trimmed.substring(0, 80),
        value: trimmed,
        lineRef,
        rawLine,
        headingContext: currentHeading
      });
    }
  });

  return symbols;
}

module.exports = { analyze };
