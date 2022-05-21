const express = require('express');

const app = express();

const { PORT } = require('./globals');

const apiRouter = express.Router();

app.get('/', (req, res) => {
  res.send('');
});

apiRouter.get('/', (req, res) => {
  res.send('Hey hey, world!');
});

app.use('/api/v1/', apiRouter);

app.listen(PORT, () => {
  console.log('Server running in port', PORT);
});
