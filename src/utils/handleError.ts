import type { ErrorRequestHandler } from 'express';
import { CustomError } from '../types/errors';

export const handleError: ErrorRequestHandler = (err: Error | CustomError, req, res, next) => {
  if(err instanceof CustomError) {
    const { statusCode, message } = err;
  
    res.status(statusCode).json({
      statusCode,
      error: message
    });
    next();
  } else {
    const { message } = err;
  
    res.status(500).json({
      statusCode: 500,
      error: message
    })
    next();
  }
};
