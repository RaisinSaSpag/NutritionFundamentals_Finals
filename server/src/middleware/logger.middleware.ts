import { Request, Response, NextFunction } from 'express';

export const piiMaskingLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    // Anonymized log entry: method, path, status, duration
    // Explicitly avoids printing req.body, req.headers, query params with PII, or health payloads
    const sanitizedUrl = req.originalUrl.split('?')[0];
    console.log(`[HTTP] ${req.method} ${sanitizedUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
