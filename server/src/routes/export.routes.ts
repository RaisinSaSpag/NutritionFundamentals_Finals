import { Router } from 'express';
import { anonymizationService } from '../services/anonymization.service';
import { ehrClient } from '../services/ehrClient.service';
import { providerService } from '../services/provider.service';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types/auth.types';

const router = Router();

router.use(authenticateToken);

// Provider-only de-identified research export
router.get('/anonymized', requireRole(['PROVIDER']), async (_req, res, next) => {
  try {
    const data = await anonymizationService.getDeidentifiedResearchDataset();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// EHR observations prefill
router.get('/ehr/observations/:patientId', requireRole(['PROVIDER']), async (req, res, next) => {
  try {
    const data = await ehrClient.fetchObservations(req.params.patientId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Push finalized chart to EHR
router.post('/ehr/sync-chart/:chartId', requireRole(['PROVIDER']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const chart = await providerService.getChart(req.params.chartId, req.user!.userId, req.user!.role);
    const syncResult = await ehrClient.pushEncounter(chart);
    res.json(syncResult);
  } catch (err) {
    next(err);
  }
});

export default router;
