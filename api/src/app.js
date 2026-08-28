'use strict';

const express         = require('express');
const ordersRouter    = require('./routes/orders');
const customersRouter = require('./routes/customers');
const errorHandler    = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', system: 'ORDERPRO API' }));
app.use('/orders',    ordersRouter);
app.use('/customers', customersRouter);
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`ORDERPRO API listening on port ${PORT}`));
}
