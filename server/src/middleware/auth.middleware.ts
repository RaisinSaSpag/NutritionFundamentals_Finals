import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { JWT_SECRET } from '../config/env';
import { AuthenticatedRequest, AuthTokenPayload, UserRole } from '../types/auth.types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as AuthTokenPayload;
    
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isActive: true, role: true }
    });

    if (!dbUser || !dbUser.isActive) {
      res.status(401).json({ error: 'Invalid or expired session token.' });
      return;
    }

    req.user = { ...decoded, role: dbUser.role as UserRole };
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