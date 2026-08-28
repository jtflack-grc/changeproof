'use strict';

/**
 * Engine mock adapter — re-exports the API mock adapter.
 * Both the API and the engine share the same SQLite database so analysis
 * queries see the same data as the API tests.
 */
module.exports = require('../../api/src/adapters/mock-adapter');
