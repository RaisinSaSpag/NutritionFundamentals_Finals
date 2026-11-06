import { Response, NextFunction } from 'express';
import { consumerService, ConsumerService } from '../services/consumer.service';
import { AuthenticatedRequest } from '../types/auth.types';

export class ConsumerController {
  constructor(private service: ConsumerService = consumerService) {}

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const profile = await this.service.getProfile(userId);
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  };

  updateHealth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updated = await this.service.updateHealth(userId, req.body);
      res.json({ message: 'Health profile updated successfully', healthProfile: updated });
    } catch (err) {
      next(err);
    }
  };

  getWeightHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const history = await this.service.getWeightLogs(userId);
      res.json({ weightHistory: history });
    } catch (err) {
      next(err);
    }
  };

  addWeightEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const entry = await this.service.addWeightLog(userId, req.body.weightKg);
      res.status(201).json({ message: 'Weight entry logged', entry });
    } catch (err) {
      next(err);
    }
  };
}

export const consumerController = new ConsumerController();
