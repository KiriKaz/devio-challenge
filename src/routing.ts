import { Router } from 'express';
import ordersRouter from './controllers/orders';
import productsRouter from './controllers/products';
// import usersRouter from './controllers/users';


const apiRouter = Router();

apiRouter.get('/', (req, res) => {
  res.send('Hey hey, world!');
});

// apiRouter.use('/users', usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);

export default apiRouter;
