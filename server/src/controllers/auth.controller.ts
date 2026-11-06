import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types/auth.types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class AuthController {
  constructor(private service: AuthService = authService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { token, user } = await this.service.login(email, password);

      res.cookie('token', token, COOKIE_OPTIONS);
      res.json({ message: 'Login successful', token, user });
    } catch (err) {
      next(err);
    }
  };

  registerConsumer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, user } = await this.service.registerConsumer(req.body);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json({ message: 'Consumer registered successfully', token, user });
    } catch (err) {
      next(err);
    }
  };

  registerProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, user } = await this.service.registerProvider(req.body);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json({ message: 'Provider registered successfully', token, user });
    } catch (err) {
      next(err);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Logged out successfully' });
  };

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await this.service.getCurrentUser(req.user.userId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
