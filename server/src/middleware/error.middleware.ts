import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Mask internal error details in production to preserve security
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    res.status(500).json({ error: 'Internal server error.' });
    return;
  }

  res.status(statusCode).json({
    error: message,
    ...(err.details && { details: err.details })
  });
};
