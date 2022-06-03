import { faker } from '@faker-js/faker';
import request from 'supertest';
import app from '../main';

describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})

describe('Client', () => {
  it('should allow an unknown client to add a product to their cart', async () => {
    const name = faker.fake('{{name.firstName}} {{name.lastName}}');
    const res = await request(app).post('/api/v1/orders/addProduct').send({
      name: name,
      product: "ESPFIL"
    });
    expect(res.statusCode).toEqual(200);
    
    // const res2 = await request(app).get(`/api/v1/orders/${name}`);
    // expect(res2.statusCode).toEqual(200);
    // expect(res2.body).toHaveProperty('client');
    // expect(res2.body).not.toHaveProperty('observation');
  })
})

describe('Kitchen', () => {
})

describe('Other', () => {
  
})