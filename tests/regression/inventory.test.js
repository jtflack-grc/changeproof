'use strict';

/**
 * Inventory allocation regression tests.
 * Independent of CHG-0042 — must pass in both baseline and post-change passes.
 */

const request = require('supertest');
const app     = require('../../api/src/app');

describe('Inventory allocation regression', () => {

  test('Order for in-stock item is accepted', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000003,
      orderType : 'S',
      items     : [{ itemNumber: 'ITM0001', quantity: 5 }],
      orderTime : '2024-11-15T10:00:00.000Z'
    });
    expect(res.status).toBe(201);
  });

  test('Customer lookup returns correct class for Preferred customer', async () => {
    const res = await request(app).get('/customers/1000002');
    expect(res.status).toBe(200);
    expect(res.body.CUSCLS).toBe('P');
  });

  test('Inactive customer data is present in surrogate', async () => {
    const res = await request(app).get('/customers/1000005');
    expect(res.status).toBe(200);
    expect(res.body.CUSSTT).toBe('I');
  });

});
