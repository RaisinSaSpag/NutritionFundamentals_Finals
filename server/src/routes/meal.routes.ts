import { Router } from 'express';
import { z } from 'zod';
import { mealController } from '../controllers/meal.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

// All meal endpoints require authentication
router.use(authenticateToken);

const logMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      foodItemId: z.string().min(1, 'foodItemId is required'),
      servings: z.number().positive('Servings must be a positive number')
    })
  ).min(1, 'At least one food item must be included')
});

const customFoodSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  category: z.string().min(1, 'Category is required'),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative(),
  sodium: z.number().nonnegative(),
  potassium: z.number().nonnegative(),
  allergenTags: z.array(z.string()).optional()
});

router.get('/foods', mealController.getFoods);
router.post('/foods', validateBody(customFoodSchema), mealController.createCustomFood);
router.post('/log', validateBody(logMealSchema), mealController.logMeal);
router.get('/day', mealController.getDayLogs);
router.delete('/:id', mealController.deleteMeal);
router.get('/analytics', mealController.getAnalytics);

export default router;
