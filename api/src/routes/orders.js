'use strict';

const express = require('express');
const router  = express.Router();
const adapter = require('../adapters/mock-adapter');

// ---------------------------------------------------------------------------
// POST /orders
// Submit a new order.
// Body: { customerId, orderType, items[], orderTime }
//   customerId : integer customer number
//   orderType  : 'E' (Expedited) or 'S' (Standard)
//   items      : [{ itemNumber, quantity }]
//   orderTime  : ISO 8601 timestamp — injected for testability;
//                defaults to current time if omitted
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { customerId, orderType, items, orderTime } = req.body || {};

    if (!customerId || !orderType || !items) {
      return res.status(400).json({ error: 'customerId, orderType, and items are required' });
    }

    const submittedAt  = orderTime ? new Date(orderTime) : new Date();
    const submittedHour = submittedAt.getUTCHours();

    // Early cutoff check in the API layer to avoid unnecessary IBM i round-trips.
    // Mirrors the cutoff logic in ORDPRC.rpgle (CHKORDCTF procedure — CHG-0042).
    // Preferred customers (CUSCLS='P') have an extended cutoff of 18:00.
    // Standard customers retain the 16:00 cutoff.
    const custRows   = await adapter.querySql('SELECT CUSCLS FROM CUSMAS WHERE CUSNUM = ?', [customerId]);
    const cuscls     = custRows.length ? custRows[0].CUSCLS : 'S';
    const cutoffHour = (cuscls === 'P') ? 18 : 16;

    if (orderType === 'E' && submittedHour >= cutoffHour) {
      return res.status(422).json({
        error       : 'ORD-4001: Cutoff time exceeded',
        cutoff      : `${cutoffHour}:00 UTC`,
        received    : submittedAt.toISOString()
      });
    }

    // Convert orderTime to HHMMSS integer for ORDPRC
    const hh    = String(submittedAt.getUTCHours()).padStart(2, '0');
    const mm    = String(submittedAt.getUTCMinutes()).padStart(2, '0');
    const ss    = String(submittedAt.getUTCSeconds()).padStart(2, '0');
    const ORDTIM = Number(`${hh}${mm}${ss}`);

    const result = await adapter.runProgram('ORDPRC', 'ORDERPRO', {
      CUSNUM: customerId,
      ORDTYP: orderType,
      ORDTIM
    });

    if (result.RESULT === '0') {
      return res.status(422).json({ error: 'ORD-4001: Order rejected by ORDPRC', detail: result.message });
    }

    // Persist order header to SQLite surrogate
    const today  = new Date();
    const ORDDAT = Number(
      `${today.getUTCFullYear()}${String(today.getUTCMonth() + 1).padStart(2, '0')}${String(today.getUTCDate()).padStart(2, '0')}`
    );
    const existing  = await adapter.querySql('SELECT MAX(ORDNUM) as maxOrd FROM ORDHED');
    const newOrdNum = ((existing[0] && existing[0].maxOrd) || 2000000) + 1;

    await adapter.querySql(
      'INSERT INTO ORDHED (ORDNUM, CUSNUM, ORDDAT, ORDTIM, ORDTYP, ORDSTS, ORDTOT) VALUES (?,?,?,?,?,?,?)',
      [newOrdNum, customerId, ORDDAT, ORDTIM, orderType, 'O', 0]
    );

    return res.status(201).json({ orderId: newOrdNum, status: 'O', cuscls: result.CUSCLS });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /orders/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const rows = await adapter.querySql(
      'SELECT * FROM ORDHED WHERE ORDNUM = ?', [Number(req.params.id)]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
