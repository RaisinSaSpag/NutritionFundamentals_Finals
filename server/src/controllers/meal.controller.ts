import { Response, NextFunction } from 'express';
import { mealService, MealService } from '../services/meal.service';
import { AuthenticatedRequest } from '../types/auth.types';

export class MealController {
  constructor(private service: MealService = mealService) {}

  getFoods = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query.q as string | undefined;
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
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
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
      // Consumers view their own; providers can pass consumerId in query
      const userId = (req.user!.role === 'PROVIDER' && req.query.consumerId)
        ? (req.query.consumerId as string)
        : req.user!.userId;

      const date = req.query.date as string | undefined;
      const analytics = await this.service.getNutritionAnalytics(userId, date);
      res.json({ analytics });
    } catch (err) {
      next(err);
    }
  };
}

export const mealController = new MealController();
