import prisma from '../config/prisma';

export class ProviderRepository {
  async getProviderConsumers(providerId: string) {
    // Return consumers who have appointments with this provider
    const appointments = await prisma.appointment.findMany({
      where: { providerId },
      include: {
        consumer: {
          include: {
            profile: true,
            healthProfile: true,
            cdsAlerts: {
              where: { dismissed: false },
              orderBy: { triggeredAt: 'desc' }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });

    // Deduplicate unique consumers
    const consumersMap = new Map<string, any>();
    for (const appt of appointments) {
      if (!consumersMap.has(appt.consumerId)) {
        consumersMap.set(appt.consumerId, {
          ...appt.consumer,
          latestAppointment: {
            id: appt.id,
            scheduledAt: appt.scheduledAt,
            status: appt.status
          }
        });
      }
    }

    return Array.from(consumersMap.values());
  }

  async hasAppointmentRelationship(providerId: string, consumerId: string): Promise<boolean> {
    const count = await prisma.appointment.count({
      where: { providerId, consumerId }
    });
    return count > 0;
  }

  async getConsumerDetailForProvider(consumerId: string) {
    return prisma.user.findUnique({
      where: { id: consumerId },
      include: {
        profile: true,
        healthProfile: true,
        weightHistory: {
          orderBy: { recordedAt: 'asc' }
        },
        cdsAlerts: {
          orderBy: { triggeredAt: 'desc' }
        },
        consumerCharts: {
          orderBy: { createdAt: 'desc' }
        },
        consumerAppointments: {
          orderBy: { scheduledAt: 'desc' }
        }
      }
    });
  }

  async createAdimeChart(data: {
    appointmentId?: string;
    consumerId: string;
    providerId: string;
    assessmentFoodNutritionHistory?: string;
    assessmentAnthropometrics?: string;
    assessmentBiochemical?: string;
    assessmentPhysicalFindings?: string;
    assessmentClientHistory?: string;
    diagnosisDomain?: string;
    diagnosisTerm?: string;
    diagnosisEtiology?: string;
    diagnosisSignsSymptoms?: string;
    pesStatement?: string;
    interventionFoodDelivery?: string;
    interventionEducation?: string;
    interventionCounseling?: string;
    interventionCoordination?: string;
    meIndicators?: string;
    meTargets?: string;
    meFollowUpDate?: Date;
  }) {
    return prisma.adimeChart.create({
      data: {
        ...data,
        status: 'DRAFT'
      }
    });
  }

  async updateAdimeChart(chartId: string, providerId: string, data: any) {
    const existing = await prisma.adimeChart.findUnique({ where: { id: chartId } });
    if (!existing) {
      throw { statusCode: 404, message: 'ADIME chart not found.' };
    }
    if (existing.providerId !== providerId) {
      throw { statusCode: 403, message: 'You are not authorized to edit this chart.' };
    }
    if (existing.status === 'FINALIZED') {
      throw { statusCode: 400, message: 'Cannot edit a finalized/locked ADIME chart.' };
    }

    return prisma.adimeChart.update({
      where: { id: chartId },
      data
    });
  }

  async finalizeAdimeChart(chartId: string, providerId: string) {
    const existing = await prisma.adimeChart.findUnique({ where: { id: chartId } });
    if (!existing) {
      throw { statusCode: 404, message: 'ADIME chart not found.' };
    }
    if (existing.providerId !== providerId) {
      throw { statusCode: 403, message: 'You are not authorized to finalize this chart.' };
    }
    if (existing.status === 'FINALIZED') {
      return existing; // Already finalized
    }

    return prisma.adimeChart.update({
      where: { id: chartId },
      data: {
        status: 'FINALIZED',
        finalizedAt: new Date()
      }
    });
  }

  async getAdimeChartById(chartId: string) {
    return prisma.adimeChart.findUnique({
      where: { id: chartId },
      include: {
        appointment: true,
        consumer: {
          include: {
            profile: true,
            healthProfile: true
          }
        },
        provider: {
          include: {
            profile: true,
            providerProfile: true
          }
        }
      }
    });
  }

  async getAvailability(providerId: string) {
    return prisma.availabilitySlot.findMany({
      where: { providerId },
      orderBy: { dayOfWeek: 'asc' }
    });
  }
}

export const providerRepository = new ProviderRepository();
