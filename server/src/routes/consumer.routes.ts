import { Router } from 'express';
import { z } from 'zod';
import { consumerController } from '../controllers/consumer.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['CONSUMER']));

const updateHealthSchema = z.object({
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).optional(),
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  nutritionGoals: z.string().optional(),
  useAsianPacificBmi: z.boolean().optional()
});

const weightSchema = z.object({
  weightKg: z.number().positive('Weight must be a positive number')
});

router.get('/profile', consumerController.getProfile);
router.put('/profile', validateBody(updateHealthSchema), consumerController.updateHealth);
router.get('/weight-history', consumerController.getWeightHistory);
router.post('/weight-history', validateBody(weightSchema), consumerController.addWeightEntry);

export default router;
