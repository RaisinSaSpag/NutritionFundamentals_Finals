import { providerRepository, ProviderRepository } from '../repositories/provider.repository';
import { formatPesStatement } from '../domain/encpt.constants';

export class ProviderService {
  constructor(private repo: ProviderRepository = providerRepository) {}

  async getMyConsumers(providerId: string) {
    return this.repo.getProviderConsumers(providerId);
  }

  async getConsumerDetail(providerId: string, consumerId: string) {
    const isAuthorized = await this.repo.hasAppointmentRelationship(providerId, consumerId);
    if (!isAuthorized) {
      throw {
        statusCode: 403,
        message: 'Access denied. You may only review data for consumers with scheduled or prior appointments with you.'
      };
    }

    const consumer = await this.repo.getConsumerDetailForProvider(consumerId);
    if (!consumer) {
      throw { statusCode: 404, message: 'Consumer not found.' };
    }

    return consumer;
  }

  async saveAdimeChart(providerId: string, data: any) {
    const isAuthorized = await this.repo.hasAppointmentRelationship(providerId, data.consumerId);
    if (!isAuthorized) {
      throw { statusCode: 403, message: 'Not authorized to create charts for this consumer.' };
    }

    const pes = formatPesStatement(
      data.diagnosisTerm || '',
      data.diagnosisEtiology || '',
      data.diagnosisSignsSymptoms || ''
    );

    return this.repo.createAdimeChart({
      ...data,
      providerId,
      pesStatement: pes,
      meFollowUpDate: data.meFollowUpDate ? new Date(data.meFollowUpDate) : undefined
    });
  }

  async updateAdimeChart(chartId: string, providerId: string, data: any) {
    const pes = formatPesStatement(
      data.diagnosisTerm || '',
      data.diagnosisEtiology || '',
      data.diagnosisSignsSymptoms || ''
    );

    return this.repo.updateAdimeChart(chartId, providerId, {
      ...data,
      pesStatement: pes,
      meFollowUpDate: data.meFollowUpDate ? new Date(data.meFollowUpDate) : undefined
    });
  }

  async finalizeAdimeChart(chartId: string, providerId: string) {
    return this.repo.finalizeAdimeChart(chartId, providerId);
  }

  async getChart(chartId: string, requesterId: string, requesterRole: string) {
    const chart = await this.repo.getAdimeChartById(chartId);
    if (!chart) {
      throw { statusCode: 404, message: 'ADIME chart not found.' };
    }

    // Consumers can only view their own charts; Providers can view charts they created
    if (requesterRole === 'CONSUMER' && chart.consumerId !== requesterId) {
      throw { statusCode: 403, message: 'Access denied.' };
    }
    if (requesterRole === 'PROVIDER' && chart.providerId !== requesterId) {
      throw { statusCode: 403, message: 'Access denied.' };
    }

    return chart;
  }

  async getAvailability(providerId: string) {
    return this.repo.getAvailability(providerId);
  }
}

export const providerService = new ProviderService();
