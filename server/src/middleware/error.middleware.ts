import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  
  if (statusCode >= 500 && !err?.expose) {
    console.error('[ERROR]', req.method, req.originalUrl.split('?')[0], err?.name, err?.code, err?.stack);
    res.status(500).json({ error: 'Internal server error.' });
    return;
  }
  
  res.status(statusCode).json({ 
    error: err?.message || 'Request failed.', 
    ...(err?.details && { details: err.details }) 
  });
};