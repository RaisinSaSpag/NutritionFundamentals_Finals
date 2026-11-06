import { Router } from 'express';
import { z } from 'zod';
import { providerController } from '../controllers/provider.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

const adimeChartSchema = z.object({
  consumerId: z.string().min(1, 'consumerId is required'),
  appointmentId: z.string().optional(),
  assessmentFoodNutritionHistory: z.string().optional(),
  assessmentAnthropometrics: z.string().optional(),
  assessmentBiochemical: z.string().optional(),
  assessmentPhysicalFindings: z.string().optional(),
  assessmentClientHistory: z.string().optional(),
  diagnosisDomain: z.enum(['INTAKE', 'CLINICAL', 'BEHAVIORAL_ENVIRONMENTAL']).optional(),
  diagnosisTerm: z.string().min(1, 'Standardized eNCPT Diagnosis term is required'),
  diagnosisEtiology: z.string().min(1, 'Etiology is required for PES statement'),
  diagnosisSignsSymptoms: z.string().min(1, 'Signs and symptoms are required for PES statement'),
  interventionFoodDelivery: z.string().optional(),
  interventionEducation: z.string().optional(),
  interventionCounseling: z.string().optional(),
  interventionCoordination: z.string().optional(),
  meIndicators: z.string().optional(),
  meTargets: z.string().optional(),
  meFollowUpDate: z.string().optional()
});

// Chart retrieval accessible to both provider and consumer
router.get('/charts/:id', providerController.getChart);

// All subsequent routes require PROVIDER role
router.use(requireRole(['PROVIDER']));

router.get('/consumers', providerController.getMyConsumers);
router.get('/consumers/:consumerId', providerController.getConsumerDetail);
router.post('/charts', validateBody(adimeChartSchema), providerController.createChart);
router.put('/charts/:id', providerController.updateChart);
router.post('/charts/:id/finalize', providerController.finalizeChart);
router.get('/availability', providerController.getAvailability);

export default router;
