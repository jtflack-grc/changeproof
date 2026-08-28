'use strict';

const request = require('supertest');
const app     = require('../src/app');

describe('GET /customers/:id', () => {
  test('returns customer data for a known Preferred customer', async () => {
    const res = await request(app).get('/customers/1000001');
    expect(res.status).toBe(200);
    expect(res.body.CUSNUM).toBe(1000001);
    expect(res.body.CUSCLS).toBe('P');
  });

  test('returns 404 for an unknown customer', async () => {
    const res = await request(app).get('/customers/9999999');
    expect(res.status).toBe(404);
  });
});
