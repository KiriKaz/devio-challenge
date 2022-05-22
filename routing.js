const { Router } = require('express');

const apiRouter = Router();
const usersRouter = require('./controllers/users');
const productsRouter = require('./controllers/products');

apiRouter.get('/', (req, res) => {
  res.send('Hey hey, world!');
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/products', productsRouter);

module.exports = apiRouter;
