import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthTokenPayload, UserRole } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'tele_nutrition_super_secret_jwt_key_2026_demo';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};
