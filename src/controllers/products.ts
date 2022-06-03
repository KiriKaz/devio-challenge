import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', async (req, res) => {
  const data = await db.getProducts();
  return res.status(200).send(data);
});

router.get('/:productReference', async (req, res) => {
  const data = await db.getDetailsAboutProduct(req.params.productReference);

  return res.status(200).send(data);
});

export default router;
