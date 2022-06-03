import { faker } from '@faker-js/faker';
import request from 'supertest';
import db from '../db';
import app from '../main';
import { Order } from '../types';

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
    let cart;
    let order: Order;

    describe('Client-facing', () => {
      it('should allow an unknown client to add a product to their cart', async () => {
        console.log(user);
        const res = await request(app).post('/api/v1/orders/addProduct').send({
          name: user,
          product: "ESPFIL"
        });
        expect(res.statusCode).toEqual(200);
        cart = res.body.cart;
        
        const localCart = await db.getClientCurrentCart(user);
        expect(localCart.products).toHaveLength(res.body.cart.products.length);
      });
      
      it('should allow a known client to add a product to their cart', async () => {
        console.log(user);
        const res = await request(app).post('/api/v1/orders/addProduct').send({
          name: user,
          product: "ESPTRA"
        });
        expect(res.statusCode).toEqual(200);
        cart = res.body.cart;
        
        const localCart = await db.getClientCurrentCart(user);
        expect(localCart.products).toHaveLength(res.body.cart.products.length);
      });
  
      it('should allow a known client to remove a product from their cart', async () => {
        console.log(user);
        const res = await request(app).patch('/api/v1/orders/cart').send({
          op: 'removeproduct',
          clientRef: user,
          productRef: "ESPTRA"
        })
        expect(res.statusCode).toEqual(200);
        cart = res.body.cart;
  
        const localCart = await db.getClientCurrentCart(user);
        expect(localCart.products).toHaveLength(res.body.cart.products.length);
      });

      it('should allow a client to checkout', async () => {
        const res = await request(app).post('/api/v1/orders/checkout').send({
          name: user,
          paymentMethod: '12341234',
          observation: undefined,
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('order');
        order = res.body.order;
        // checkout(clientReference: string, paymentMethod: string, observation: string | undefined): Promise<Order> -> should allow checking out and create a new order and empty the cart
      })
      
      it('should allow a client to see their cart', async () => {
        const res = await request(app).get(`/api/v1/orders/cart/${user}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('products');
        expect(res.body.products).toHaveLength(0); // Post-checkout, it'll be empty.
      })
      
      // getClientCurrentCart(clientReference: string): Promise<Cart> -> should return cart whether its empty or not

      describe('Kitchen-facing', () => {
        it('should return details from a specific order when querying /api/v1/orders/:order', async () => {
          const res = await request(app).get(`/api/v1/orders/${order._id}`);

          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty("complete");
        });

        it('should return the order and mark it as complete when patching /api/v1/orders/:order with op \'complete\'', async () => {
          const res = await request(app).patch(`/api/v1/orders/${order._id}`).send({
            op: "complete"
          });

          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('complete');
          expect(res.body.complete).toBeTruthy();
        })

        it('should return the order and mark it as incomplete when patching /api/v1/orders/:order with op \'incomplete\'', async () => {
          const res = await request(app).patch(`/api/v1/orders/${order._id}`).send({
            op: "incomplete"
          });

          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('complete');
          expect(res.body.complete).toBeFalsy();
        })

        it('should return the order and mark edit the observation when patching /api/v1/orders/:order with op \'observation\'', async () => {
          const res = await request(app).patch(`/api/v1/orders/${order._id}`).send({
            op: "observation",
            observation: "No pickles."
          });

          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('observation');
          expect(res.body.observation).toEqual("No pickles.");
          // modifyOrderObservation(reference: string, observation: string | null): Promise<Order> -> should allow modification of incomplete order
        })
      });
    });
  });
})
