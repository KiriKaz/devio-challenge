import type { Request, Response } from "express";
import express from 'express';
import { PORT } from './globals';
import apiRouter from './routing';

const app = express();


app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.redirect('/api/v1/');
});

app.use('/api/v1/', apiRouter);

app.listen(PORT, () => {
  console.log('Server running in port', PORT);
});
