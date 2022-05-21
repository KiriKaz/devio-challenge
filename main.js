const express = require('express');

const app = express();

const { PORT } = require('./globals');
const apiRouter = require('./routing');

app.get('/', (req, res) => {
  res.send('');
});

app.use('/api/v1/', apiRouter);

app.listen(PORT, () => {
  console.log('Server running in port', PORT);
});
