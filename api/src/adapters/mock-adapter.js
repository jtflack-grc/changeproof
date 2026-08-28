'use strict';

const path = require('path');
const fs   = require('fs');
const IbmIAdapter = require('./ibmi-adapter');

// Resolve paths relative to repo root (api/src/adapters/ → three levels up)
const REPO_ROOT   = path.resolve(__dirname, '..', '..', '..');
const SCHEMA_PATH = path.join(REPO_ROOT, 'orderpro', 'sql', 'sqlite', 'schema.sql');
const SEED_PATH   = path.join(REPO_ROOT, 'orderpro', 'sql', 'sqlite', 'seed.sql');

// sql.js asm.js build — pure JavaScript, no native compilation required.
// This is the LOCAL HACKATHON SURROGATE database.
// NOT equivalent to Db2 for i runtime semantics.
const SQL_ASM_PATH = path.join(REPO_ROOT, 'node_modules', 'sql.js', 'dist', 'sql-asm.js');

let _dbPromise = null;

/**
 * Returns a promise that resolves to a sql.js Database instance.
 * Initialises schema and seeds data on first call.
 * Subsequent calls return the cached promise (singleton).
 */
function getDb() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = (async () => {
    const initSqlJs = require(SQL_ASM_PATH);  // eslint-disable-line global-require
    const SQL = await initSqlJs();
    const db  = new SQL.Database();
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    const seed   = fs.readFileSync(SEED_PATH,   'utf8');
    db.run(schema);
    db.run(seed);
    return db;
  })();
  return _dbPromise;
}

/**
 * Execute a query and return rows as plain objects.
 * sql.js exec() returns [{columns, values}] per result set.
 */
async function queryAll(sql, params) {
  const db      = await getDb();
  // Simple positional ? substitution (safe for controlled demo use)
  const paramsCopy = params ? [...params] : [];
  const resolved   = sql.replace(/\?/g, () => {
    const v = paramsCopy.shift();
    if (v === null || v === undefined) return 'NULL';
    return typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
  });

  const results = db.exec(resolved);
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

async function runWrite(sql, params) {
  const db = await getDb();
  const paramsCopy = params ? [...params] : [];
  const resolved   = sql.replace(/\?/g, () => {
    const v = paramsCopy.shift();
    if (v === null || v === undefined) return 'NULL';
    return typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
  });
  db.run(resolved);
}

// ---------------------------------------------------------------------------
// ORDPRC fixture — replicates CHKORDCTF logic from ORDPRC.rpgle
// CHG-0042: Preferred customers have extended cutoff of 18:00:00
// ---------------------------------------------------------------------------
async function fixtureOrdprc(params) {
  const { CUSNUM, ORDTYP, ORDTIM } = params;

  const rows   = await queryAll(`SELECT CUSCLS FROM CUSMAS WHERE CUSNUM = ${Number(CUSNUM)}`);
  const cuscls = rows.length ? rows[0].CUSCLS : 'S';

  if (ORDTYP !== 'E') {
    return { RESULT: '1', CUSCLS: cuscls, message: 'Standard order accepted' };
  }

  // CHG-0042: Preferred customers have extended cutoff of 18:00:00
  const cutoff = (cuscls === 'P') ? 180000 : 160000;
  if (Number(ORDTIM) <= cutoff) {
    return { RESULT: '1', CUSCLS: cuscls, message: 'Expedited order accepted' };
  }
  return { RESULT: '0', CUSCLS: cuscls, message: 'Cutoff exceeded — order rejected' };
}

async function fixtureFulmnt() {
  const rows = await queryAll("SELECT COUNT(*) as cnt FROM ORDHED WHERE ORDSTS = 'O' AND ORDTYP = 'E'");
  const cnt  = rows.length ? rows[0].cnt : 0;
  return { status: 'simulated', processed: cnt, message: `FULMNT fixture: ${cnt} open expedited orders in queue` };
}

// ---------------------------------------------------------------------------
class MockAdapter extends IbmIAdapter {
  async compile(member, library) {
    return {
      status  : 'simulated', member, library,
      messages: [`Compile of ${library}/${member} simulated locally — IBM_I validation required for real compilation`]
    };
  }

  async runProgram(pgm, library, params) {
    const name = (pgm || '').toUpperCase();
    if (name === 'ORDPRC') return fixtureOrdprc(params || {});
    if (name === 'FULMNT') return fixtureFulmnt();
    return { status: 'simulated', pgm, library, message: `No fixture for ${pgm}` };
  }

  async querySql(sql, params = []) {
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(sql);
    if (isWrite) {
      await runWrite(sql, params);
      return [];
    }
    return queryAll(sql, params ? [...params] : []);
  }
}

module.exports = new MockAdapter();
