import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger/index.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled Application Error', {
    error: err.message,
    stack: err.stack,
    correlationId: req.correlationId,
    path: req.originalUrl,
    method: req.method
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Failed',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
      correlationId: req.correlationId
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication failed. Invalid statutory credentials.',
      correlationId: req.correlationId
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    correlationId: req.correlationId
  });
}
