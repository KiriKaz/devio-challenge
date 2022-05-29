const { Router } = require('express');

const apiRouter = Router();
const usersRouter = require('./controllers/users');
const productsRouter = require('./controllers/products');
const ordersRouter = require('./controllers/orders');

apiRouter.get('/', (req, res) => {
  res.send('Hey hey, world!');
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);

module.exports = apiRouter;
