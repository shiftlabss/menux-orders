import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors';
import { logger } from '@shared/logger';
import { ZodError } from 'zod';
import { config } from '@shared/config';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(
    {
      err,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
    },
    'Request failed',
  );

  if (err instanceof AppError) {
    return res.status(err.code).json({
      status: 'error',
      message: err.message,
      requestId: req.requestId,
      ...(err instanceof Object && 'details' in err ? { details: (err as any).details } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      details: err.errors,
      requestId: req.requestId,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    requestId: req.requestId,
    ...(config.env === 'development' ? { stack: err.stack, details: err } : {}),
  });
};
