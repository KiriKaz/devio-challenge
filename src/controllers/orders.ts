import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  const orders = db.getCurrentOrders();
  return res.status(200).json(orders);
});

router.get('/:orderRef', (req, res) => {
  const order = db.getDetailsAboutOrder(req.params.orderRef);
  return res.status(200).json(order);
});

router.post('/checkout', (req, res) => {
  const { name, observation } = req.body;

  const ret = db.checkout(name, observation);

  switch (ret) {
    case -1:
      return res.status(500).json({ error: 'NAME_ERROR' });
    case -2:
      return res.status(500).json({ error: 'CART_NOT_FOUND' });
    case -3:
      return res.status(500).json({ error: 'CART_EMPTY' });
    default:
      return res.status(201).json({ order: ret });
  }
});

router.post('/addProduct', (req, res) => {
  const { name, product } = req.body;

  db.addProductToCartWithRef(name, product);

  return res.status(200).end();
});

router.patch('/:order', (req, res) => {
  const { op } = req.body;
  const { order } = req.params;

  switch (op.toLowerCase()) {
    case 'complete':
      db.markOrderAsComplete(order);
      return res.status(200).end();
    case 'incomplete':
      db.markOrderAsIncomplete(order);
      return res.status(200).end();
    case 'observation': {
      const ret = db.modifyOrderObservation(order, req.body.observation);
      if (ret === -1)
        return res.status(403).json({ error: 'ORDER_ALREADY_COMPLETE' });
      return res.status(200).end();
    }
    default:
      return res.status(500).end();
  }
});

export default router;