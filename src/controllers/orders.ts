import { Router } from 'express';
import db from '../db';
import { UnknownOperation } from '../types/errors';

const router = Router();

router.get('/', async (req, res) => {
  const orders = await db.getCurrentOrders();
  return res.status(200).json(orders);
});

router.get('/:orderRef', async (req, res) => {
  const order = await db.getDetailsAboutOrder(decodeURIComponent(req.params.orderRef));
  return res.status(200).json(order);
});

router.get('/cart/:clientRef', async (req, res) => {
  const cart = await db.getClientCurrentCart(decodeURIComponent(req.params.clientRef));
  return res.status(200).json(cart);
})

router.post('/checkout', async (req, res) => {
  const { name, paymentMethod, observation } = req.body;

  const ret = await db.checkout(name, paymentMethod, observation);
  return res.status(201).json({ order: ret });
});

router.post('/addProduct', async (req, res) => {
  const { name, product } = req.body;

  const client = await db.addProductToCartWithRef(name, product);

  return res.status(200).json(client);
});

router.patch('/cart', async (req, res) => {
  const { op, clientRef } = req.body;

  switch(op.toLowerCase()) {
    case 'removeproduct': {
      const updated = await db.removeProductFromCartWithRef(clientRef, req.body.productRef);
      return res.status(200).json(updated);
    }
  }
});

router.patch('/:order', async (req, res) => {
  const { op } = req.body;
  const order = decodeURIComponent(req.params.order);

  switch (op.toLowerCase()) {
    case 'complete': {
      const updated = await db.markOrderAsComplete(order);
      return res.status(200).json(updated);
    }
    case 'incomplete': {
      const updated = await db.markOrderAsIncomplete(order);
      return res.status(200).json(updated);
    }
    case 'observation': {
      const updated = await db.modifyOrderObservation(order, req.body.observation);
      return res.status(200).json(updated);
    }
    default:
      throw new UnknownOperation();
  }
});

export default router;