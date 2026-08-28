'use strict';

/**
 * @interface IbmIAdapter  (engine copy)
 *
 * Transport-independent interface for IBM i capabilities used by the
 * ChangeProof analysis engine.
 *
 * Conservative IBM i implementation options:
 *
 *   SQL query (querySql):
 *     - idb-connector : Node.js ODBC bindings for Db2 for i
 *     - itoolkit       : XMLSERVICE SQL via /cgi-bin/xmlcgi.pgm
 *
 *   Program call (runProgram):
 *     - itoolkit       : XMLSERVICE iPgm call
 *     - SSH            : invoke via QSYS command over SSH session
 *
 *   Compile / system command (compile):
 *     - SSH + CRTBNDRPG     : SSH session, CL compile command
 *     - QSYS2.QCMDEXC       : execute CL via Db2 stored procedure (ODBC)
 */
class IbmIAdapter {
  // eslint-disable-next-line no-unused-vars
  async compile(member, library) { throw new Error('NotImplemented'); }
  // eslint-disable-next-line no-unused-vars
  async runProgram(pgm, library, params) { throw new Error('NotImplemented'); }
  // eslint-disable-next-line no-unused-vars
  async querySql(sql, params = []) { throw new Error('NotImplemented'); }
}

module.exports = IbmIAdapter;
