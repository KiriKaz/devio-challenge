const express = require('express');

const apiRouter = express.Router();
const usersRouter = require('./controllers/users');

apiRouter.get('/', (req, res) => {
  res.send('Hey hey, world!');
});

apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
