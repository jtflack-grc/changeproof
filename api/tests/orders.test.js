'use strict';

const request = require('supertest');
const app     = require('../src/app');

describe('POST /orders', () => {
  test('accepts a valid standard order well before cutoff', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000003,
      orderType : 'S',
      items     : [{ itemNumber: 'ITM0001', quantity: 5 }],
      orderTime : '2024-11-15T10:00:00.000Z'  // 10:00 UTC
    });
    expect(res.status).toBe(201);
  });

  test('rejects a request with missing required fields', async () => {
    const res = await request(app).post('/orders').send({ customerId: 1000003 });
    expect(res.status).toBe(400);
  });

  test('rejects an expedited order submitted after cutoff (hour=17)', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000003,        // Standard customer
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 2 }],
      orderTime : '2024-11-15T17:00:00.000Z'  // 17:00 UTC — after 16:00 cutoff
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/ORD-4001/);
  });

  test('accepts an expedited order submitted before cutoff (hour=15)', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000003,        // Standard customer
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 2 }],
      orderTime : '2024-11-15T15:00:00.000Z'  // 15:00 UTC — before 16:00 cutoff
    });
    expect(res.status).toBe(201);
  });

  test('accepts Preferred customer expedited order at 17:00 (CHG-0042)', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000001,        // Preferred customer (P)
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 1 }],
      orderTime : '2024-11-15T17:00:00.000Z'  // 17:00 UTC — before 18:00 Preferred cutoff
    });
    expect(res.status).toBe(201);
  });

  test('rejects Preferred customer expedited order at 19:00 (after 18:00 cutoff)', async () => {
    const res = await request(app).post('/orders').send({
      customerId: 1000001,        // Preferred customer (P)
      orderType : 'E',
      items     : [{ itemNumber: 'ITM0001', quantity: 1 }],
      orderTime : '2024-11-15T19:00:00.000Z'  // 19:00 UTC — after 18:00 Preferred cutoff
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/ORD-4001/);
  });
});

describe('GET /orders/:id', () => {
  test('returns 404 for an unknown order', async () => {
    const res = await request(app).get('/orders/9999999');
    expect(res.status).toBe(404);
  });
});
