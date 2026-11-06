import { Router } from 'express';
import { z } from 'zod';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

const bookSchema = z.object({
  providerId: z.string().min(1, 'providerId is required'),
  scheduledAt: z.string().min(1, 'scheduledAt ISO date is required'),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
});

router.post('/book', requireRole(['CONSUMER']), validateBody(bookSchema), appointmentController.bookAppointment);
router.get('/my', appointmentController.getMyAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.patch('/:id/status', validateBody(statusSchema), appointmentController.updateStatus);
router.get('/:id/room', appointmentController.getSessionRoom);

export default router;
