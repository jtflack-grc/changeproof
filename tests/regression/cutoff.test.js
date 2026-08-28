'use strict';

/**
 * Cutoff regression tests — CHG-0042
 *
 * PRE-CHG-0042 state:
 *   All customers: expedited cutoff = 16:00 (no class distinction)
 *
 * The test "Preferred customer expedited order at 17:00 should be accepted"
 * is EXPECTED TO FAIL before CHG-0042 is implemented. This failing test is
 * the primary evidence of test gap #7 in the ChangeProof baseline pack.
 *
 * After CHG-0042 is applied, all four tests must pass.
 */

const request = require('supertest');
const app     = require('../../api/src/app');

describe('Cutoff regression — CHG-0042', () => {

  test('Standard customer expedited order at 15:00 is accepted', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000003,
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 1 }],
      orderTime : '2024-11-15T15:00:00.000Z'
    });
    expect(res.status).toBe(201);
  });

  test('Standard customer expedited order at 17:00 is rejected', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000003,
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 1 }],
      orderTime : '2024-11-15T17:00:00.000Z'
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/ORD-4001/);
  });

  test('Preferred customer expedited order at 17:00 should be accepted (CHG-0042)', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000001,
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 1 }],
      orderTime : '2024-11-15T17:00:00.000Z'
    });
    expect(res.status).toBe(201);
  });

  test('Preferred customer expedited order at 19:00 is rejected', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000001,
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 1 }],
      orderTime : '2024-11-15T19:00:00.000Z'
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/ORD-4001/);
  });

});
