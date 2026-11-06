import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const consumerRegisterSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  healthProfile: z.object({
    sex: z.enum(['MALE', 'FEMALE', 'OTHER']),
    heightCm: z.number().positive('Height must be positive'),
    weightKg: z.number().positive('Weight must be positive'),
    activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']),
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    nutritionGoals: z.string().optional(),
    useAsianPacificBmi: z.boolean().optional()
  })
});

const providerRegisterSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  providerProfile: z.object({
    licenseNumber: z.string().min(1, 'License number is required'),
    credentials: z.string().min(1, 'Credentials are required (e.g. RDN, LDN)'),
    bio: z.string().min(1, 'Professional bio is required'),
    specialties: z.array(z.string()).optional()
  })
});

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/register/consumer', validateBody(consumerRegisterSchema), authController.registerConsumer);
router.post('/register/provider', validateBody(providerRegisterSchema), authController.registerProvider);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

export default router;
