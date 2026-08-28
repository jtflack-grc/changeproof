'use strict';

/**
 * @interface IbmIAdapter
 *
 * Transport-independent interface contract for IBM i capabilities.
 * Concrete implementations must provide all three methods.
 *
 * Conservative IBM i implementation options (documentation only —
 * none of these packages are imported here):
 *
 *   SQL query (querySql):
 *     - idb-connector  : Node.js ODBC bindings for Db2 for i (IBM-supplied)
 *     - itoolkit        : XMLSERVICE-based SQL call via /cgi-bin/xmlcgi.pgm
 *
 *   Program call (runProgram):
 *     - itoolkit        : XMLSERVICE iPgm call
 *     - SSH             : invoke program via QSYS command over SSH session
 *
 *   Compile / system command (compile):
 *     - SSH + CRTBNDRPG : SSH session, submit CL compile command
 *     - QSYS2.QCMDEXC   : execute CL command via Db2 stored procedure (ODBC)
 *
 * To add a real IBM i adapter: implement this class and inject the instance
 * into the application factory. The local mock adapter (mock-adapter.js)
 * is the default for local/hackathon use.
 */
class IbmIAdapter {
  /**
   * Compile an IBM i source member.
   *
   * IBM i options:
   *   SSH:  system "CRTBNDRPG PGM(LIBRARY/MEMBER) SRCFILE(LIBRARY/QRPGLESRC)"
   *   ODBC: CALL QSYS2.QCMDEXC('CRTBNDRPG ...', length)
   *
   * @param {string} member   - Source member name (e.g. 'ORDPRC')
   * @param {string} library  - Library name (e.g. 'ORDERPRO')
   * @returns {Promise<{status: string, member: string, library: string, messages: string[]}>}
   */
  // eslint-disable-next-line no-unused-vars
  async compile(member, library) {
    throw new Error('NotImplemented: use a concrete adapter (see mock-adapter.js)');
  }

  /**
   * Call an IBM i program with parameters.
   *
   * IBM i options:
   *   itoolkit: new ProgramCall(pgm, {lib: library}) via XMLSERVICE
   *   SSH:      pass parameters through a wrapper CL program
   *
   * @param {string} pgm      - Program name (e.g. 'ORDPRC')
   * @param {string} library  - Library name (e.g. 'ORDERPRO')
   * @param {Object} params   - Key/value parameter map
   * @returns {Promise<Object>} Program output as plain object
   */
  // eslint-disable-next-line no-unused-vars
  async runProgram(pgm, library, params) {
    throw new Error('NotImplemented: use a concrete adapter (see mock-adapter.js)');
  }

  /**
   * Execute a SQL query against Db2 for i (or local surrogate).
   *
   * IBM i options:
   *   idb-connector: const db = new idbConnection(); db.query(sql, params, cb)
   *   itoolkit:      SqlCall via XMLSERVICE
   *
   * @param {string} sql      - SQL statement (use ? for parameter placeholders)
   * @param {Array}  [params] - Positional parameter values
   * @returns {Promise<Array<Object>>} Array of row objects
   */
  // eslint-disable-next-line no-unused-vars
  async querySql(sql, params = []) {
    throw new Error('NotImplemented: use a concrete adapter (see mock-adapter.js)');
  }
}

module.exports = IbmIAdapter;
