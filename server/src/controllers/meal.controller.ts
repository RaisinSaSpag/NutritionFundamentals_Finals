import { Response, NextFunction } from 'express';
import { mealService, MealService } from '../services/meal.service';
import { providerRepository } from '../repositories/provider.repository';
import { AuthenticatedRequest } from '../types/auth.types';

export class MealController {
  constructor(private service: MealService = mealService) {}

  getFoods = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // SECURITY FIX M10: Validate that q is a string and limit length
      const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : undefined;
      const foods = await this.service.searchFoods(q);
      res.json({ foods });
    } catch (err) {
      next(err);
    }
  };

  createCustomFood = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const food = await this.service.createCustomFood(req.body);
      res.status(201).json({ food });
    } catch (err) {
      next(err);
    }
  };

  logMeal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const meal = await this.service.logMeal(userId, req.body);
      res.status(201).json({ message: 'Meal logged successfully', meal });
    } catch (err) {
      next(err);
    }
  };

  getDayLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      // SECURITY FIX M10: Validate date format to prevent Prisma errors
      const rawDate = req.query.date;
      const date = (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) 
        ? rawDate 
        : new Date().toISOString().split('T')[0];
        
      const logs = await this.service.getDayLogs(userId, date);
      res.json({ date, logs });
    } catch (err) {
      next(err);
    }
  };

  deleteMeal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.service.deleteMeal(req.params.id, userId);
      res.json({ message: 'Meal log removed' });
    } catch (err) {
      next(err);
    }
  };

  getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let targetUserId = req.user!.userId;

      // SECURITY FIX H4: Prevent IDOR (Insecure Direct Object Reference)
      if (req.user!.role === 'PROVIDER' && req.query.consumerId !== undefined) {
        const consumerId = req.query.consumerId;

        if (typeof consumerId !== 'string' || !consumerId) {
          res.status(400).json({ error: 'Invalid consumerId.' });
          return;
        }

        // Verify the provider actually has an appointment with this consumer
        const hasAccess = await providerRepository.hasAppointmentRelationship(req.user!.userId, consumerId);
        
        if (!hasAccess) {
          res.status(403).json({ error: 'Access denied. No clinical relationship with this consumer.' });
          return;
        }

        targetUserId = consumerId;
      }

      // SECURITY FIX M10: Validate date format
      const rawDate = req.query.date;
      const date = (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) 
        ? rawDate 
        : undefined;

      const analytics = await this.service.getNutritionAnalytics(targetUserId, date);
      res.json({ analytics });
    } catch (err) {
      next(err);
    }
  };
}

export const mealController = new MealController();