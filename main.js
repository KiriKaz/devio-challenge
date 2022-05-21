const express = require('express');

const app = express();

const { PORT } = require('./globals');
const apiRouter = require('./routing');

app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/api/v1/');
});

app.use('/api/v1/', apiRouter);

app.listen(PORT, () => {
  console.log('Server running in port', PORT);
});
