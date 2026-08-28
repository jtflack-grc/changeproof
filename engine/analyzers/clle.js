'use strict';

const fs = require('fs');

/**
 * Generic CL program analyzer.
 * Extracts symbols from IBM i CL source.
 * Returns RawSymbol[] — no change-request-specific rules.
 *
 * CL continuation: a line ending with + (optionally followed by whitespace/comment)
 * continues on the next line. This analyzer joins continuation lines before
 * parsing so SBMJOB keyword/value pairs spanning multiple physical lines are
 * captured on the logical command line.
 *
 * @param {string} filePath
 * @returns {Array<{type,name,value,lineRef,rawLine}>}
 */
function analyze(filePath) {
  const rawLines = fs.readFileSync(filePath, 'utf8').split('\n');
  const rel      = filePath.replace(/\\/g, '/');

  const logicalLines = [];
  let buf = null;
  let bufStart = 0;

  rawLines.forEach((raw, i) => {
    const lineNum = i + 1;
    const stripped = raw.replace(/\/\*[^*]*\*\//g, '').trimEnd();
    const isCont   = stripped.endsWith('+');

    if (buf === null) {
      buf      = isCont ? stripped.slice(0, -1) : raw;
      bufStart = lineNum;
    } else {
      buf += isCont ? raw.trim().replace(/\+$/, '') : raw.trim();
    }

    if (!isCont) {
      logicalLines.push({ text: buf, lineNum: bufStart, rawLine: raw });
      buf = null;
    }
  });
  if (buf !== null) {
    logicalLines.push({ text: buf, lineNum: bufStart, rawLine: buf });
  }

  const symbols = [];

  logicalLines.forEach(({ text, lineNum, rawLine }) => {
    const lineRef = `${rel}:${lineNum}`;
    const upper   = text.toUpperCase();

    if (/^\s*PGM(\s|$)/.test(upper)) {
      symbols.push({ type: 'pgm_start', name: 'PGM', value: '', lineRef, rawLine });
    }
    if (/^\s*ENDPGM(\s|$)/.test(upper)) {
      symbols.push({ type: 'pgm_end', name: 'ENDPGM', value: '', lineRef, rawLine });
    }

    const callMatch = upper.match(/CALL\s+PGM\(([^)]+)\)/);
    if (callMatch) {
      symbols.push({ type: 'call', name: callMatch[1].trim(), value: '', lineRef, rawLine });
    }

    if (/\bSBMJOB\b/.test(upper)) {
      symbols.push({ type: 'cmd', name: 'SBMJOB', value: text.trim(), lineRef, rawLine });
      const kvPattern = /\b(\w+)\(([^)]+)\)/g;
      let m;
      while ((m = kvPattern.exec(upper)) !== null) {
        symbols.push({ type: 'cmd_param', name: m[1], value: m[2].trim(), lineRef, rawLine });
      }
    }

    const blockComment = rawLine.match(/\/\*\s*(.+?)\s*\*\//);
    if (blockComment) {
      symbols.push({ type: 'comment', name: 'comment', value: blockComment[1].trim(), lineRef, rawLine });
    }
  });

  return symbols;
}

module.exports = { analyze };
