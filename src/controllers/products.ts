import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  const data = db.getProducts();
  return res.status(200).send(data);
});

router.get('/:productReference', (req, res) => {
  const data = db.getDetailsAboutProduct(req.params.productReference);

  if (data === -1) return res.status(500).json({ error: 'UNKNOWN_PRODUCT' });

  return res.status(200).send(data);
});

export default router;
