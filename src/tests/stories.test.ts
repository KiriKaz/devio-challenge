import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import request from 'supertest';
import db from '../db';
import app from '../main';
import { Cart, Order } from '../types';

class sorryThisIsRequiredLol {
  cart: Cart | null
  order: Order | null

  constructor() {
    this.cart = null;
    this.order = null;
  }

  async setCart(cart: Cart) {
    this.cart = cart;
  }

  async getCart() {
    return this.cart;
  }

  async setOrder(order: Order) {
    this.order = order;
  }

  async getOrder() {
    return this.order;
  }
}

const globalVariables = new sorryThisIsRequiredLol();  // I couldn't find a better implementation in the short amount of time I had to optimize these tests.

describe('Tests', () => {
  it('should return all products when querying /api/v1/products/', async () => {
    const res = await request(app).get('/api/v1/products/');
    const products = await db.getProducts();
    expect(res.body).toHaveLength(products.length);
  });
  
  it('should allow anyone to check the info for a given product', async () => {
    const res = await request(app).get('/api/v1/products/ESPFIL');
    expect(res.statusCode).toEqual(200);

    const product = await db.getDetailsAboutProduct('ESPFIL');
    expect(res.body).toHaveProperty("name");
    expect(res.body.name).toBe(product.name);
  });

  it('should return all current orders when querying /api/v1/orders/', async () => {
    const res = await request(app).get('/api/v1/orders/');
    const orders = await db.getCurrentOrders();
    expect(res.body).toHaveLength(orders.length);
  })
  
  describe('Order workflow', () => {
    const user = faker.fake('{{name.firstName}} {{name.lastName}}');

    describe('Client-facing', () => {
      it('should allow an unknown client to add a product to their cart', async () => {
        const res = await request(app).post('/api/v1/orders/addProduct').send({
          name: user,
          product: "ESPFIL"
        });
        await expect(res.statusCode).toEqual(200);
        await globalVariables.setCart(res.body.cart);
        
        const localCart = await db.getClientCurrentCart(user);
        await expect(localCart.products).toHaveLength(res.body.cart.products.length);
      });
      
      it('should allow a known client to add a product to their cart', async () => {
        const res = await request(app).post('/api/v1/orders/addProduct').send({
          name: user,
          product: "ESPTRA"
        });
        await expect(res.statusCode).toEqual(200);
        await globalVariables.setCart(res.body.cart);
        
        const localCart = await db.getClientCurrentCart(user);
        await expect(localCart.products).toHaveLength(res.body.cart.products.length);
      });
  
      it('should allow a known client to remove a product from their cart', async () => {
        const res = await request(app).patch('/api/v1/orders/cart').send({
          op: 'removeproduct',
          clientRef: user,
          productRef: "ESPTRA"
        })
        await expect(res.statusCode).toEqual(200);
        await globalVariables.setCart(res.body.cart);
  
        const localCart = await db.getClientCurrentCart(user);
        await expect(localCart.products).toHaveLength(res.body.cart.products.length);
      });

      it('should allow a client to checkout', async () => {
        const res = await request(app).post('/api/v1/orders/checkout').send({
          name: user,
          paymentMethod: '12341234',
          observation: undefined,
        });

        await expect(res.status).toBe(201);
        await expect(res.body).toHaveProperty('order');
        await globalVariables.setOrder(res.body.order);
      })
      
      it('should allow a client to see their cart', async () => {
        const res = await request(app).get(`/api/v1/orders/cart/${user}`);

        await expect(res.status).toBe(200);
        await expect(res.body).toHaveProperty('products');
        await expect(res.body.products).toHaveLength(0); // Post-checkout, it'll be empty.
      })
    });
    
    describe('Kitchen-facing', () => {
      it('should return details from a specific order when querying /api/v1/orders/:order', async () => {
        const order = await globalVariables.getOrder();
        const res = await request(app).get(`/api/v1/orders/${order!._id}`);
        
        await expect(res.status).toBe(200);
        await expect(res.body).toHaveProperty("complete");
      });

      it('should return the order and mark it as complete when patching /api/v1/orders/:order with op \'complete\'', async () => {
        const order = await globalVariables.getOrder();
        const res = await request(app).patch(`/api/v1/orders/${order!._id}`).send({
          op: "complete"
        });
        
        await expect(res.status).toBe(200);
        await expect(res.body).toHaveProperty('complete');
        await expect(res.body.complete).toBeTruthy();
      });

      it('should return the order and mark it as incomplete when patching /api/v1/orders/:order with op \'incomplete\'', async () => {
        const order = await globalVariables.getOrder();
        const res = await request(app).patch(`/api/v1/orders/${order!._id}`).send({
          op: "incomplete"
        });

        await expect(res.status).toBe(200);
        await expect(res.body).toHaveProperty('complete');
        await expect(res.body.complete).toBeFalsy();
      });

      it('should return the order and mark edit the observation when patching /api/v1/orders/:order with op \'observation\'', async () => {
        const order = await globalVariables.getOrder();
        const res = await request(app).patch(`/api/v1/orders/${order!._id}`).send({
          op: "observation",
          observation: "No pickles."
        });

        await expect(res.status).toBe(200);
        await expect(res.body).toHaveProperty('observation');
        await expect(res.body.observation).toEqual("No pickles.");
        // modifyOrderObservation(reference: string, observation: string | null): Promise<Order> -> should allow modification of incomplete order
      });
    });
  });
})

afterAll(async () => {
  app.close();
  await mongoose.disconnect();
});