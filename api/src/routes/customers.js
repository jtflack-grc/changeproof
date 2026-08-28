'use strict';

const express = require('express');
const router  = express.Router();
const adapter = require('../adapters/mock-adapter');

// GET /customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const rows = await adapter.querySql(
      'SELECT * FROM CUSMAS WHERE CUSNUM = ?', [Number(req.params.id)]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
