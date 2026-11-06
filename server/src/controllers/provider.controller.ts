import { Response, NextFunction } from 'express';
import { providerService, ProviderService } from '../services/provider.service';
import { AuthenticatedRequest } from '../types/auth.types';

export class ProviderController {
  constructor(private service: ProviderService = providerService) {}

  getMyConsumers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId = req.user!.userId;
      const consumers = await this.service.getMyConsumers(providerId);
      res.json({ consumers });
    } catch (err) {
      next(err);
    }
  };

  getConsumerDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId = req.user!.userId;
      const consumerId = req.params.consumerId;
      const consumer = await this.service.getConsumerDetail(providerId, consumerId);
      res.json({ consumer });
    } catch (err) {
      next(err);
    }
  };

  createChart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId = req.user!.userId;
      const chart = await this.service.saveAdimeChart(providerId, req.body);
      res.status(201).json({ message: 'ADIME chart saved as draft', chart });
    } catch (err) {
      next(err);
    }
  };

  updateChart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId = req.user!.userId;
      const chartId = req.params.id;
      const chart = await this.service.updateAdimeChart(chartId, providerId, req.body);
      res.json({ message: 'ADIME chart updated', chart });
    } catch (err) {
      next(err);
    }
  };

  finalizeChart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId = req.user!.userId;
      const chartId = req.params.id;
      const chart = await this.service.finalizeAdimeChart(chartId, providerId);
      res.json({ message: 'ADIME chart successfully finalized and locked', chart });
    } catch (err) {
      next(err);
    }
  };

  getChart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chart = await this.service.getChart(req.params.id, req.user!.userId, req.user!.role);
      res.json({ chart });
    } catch (err) {
      next(err);
    }
  };

  getAvailability = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId = req.user!.userId;
      const slots = await this.service.getAvailability(providerId);
      res.json({ availability: slots });
    } catch (err) {
      next(err);
    }
  };
}

export const providerController = new ProviderController();
