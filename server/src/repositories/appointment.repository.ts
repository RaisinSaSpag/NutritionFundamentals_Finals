import { randomUUID } from 'crypto';
import prisma from '../config/prisma';

export class AppointmentRepository {
  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        consumer: { include: { profile: true, healthProfile: true } },
        provider: { include: { profile: true, providerProfile: true } },
        charts: true
      }
    });
  }

  async isProviderBooked(providerId: string, scheduledAt: Date): Promise<boolean> {
    const existing = await prisma.appointment.findFirst({
      where: {
        providerId,
        scheduledAt,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      }
    });
    return !!existing;
  }

  async createAppointment(data: {
    consumerId: string;
    providerId: string;
    scheduledAt: Date;
    durationMinutes?: number;
    notes?: string;
  }) {
    const uniqueRoom = `telenutrition-${randomUUID().replace(/-/g, '').substring(0, 16)}-${Date.now().toString(36)}`;

    return prisma.appointment.create({
      data: {
        consumerId: data.consumerId,
        providerId: data.providerId,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes || 30,
        status: 'SCHEDULED',
        roomName: uniqueRoom,
        notes: data.notes
      },
      include: {
        consumer: { include: { profile: true } },
        provider: { include: { profile: true, providerProfile: true } }
      }
    });
  }

  async getAppointmentsForUser(userId: string, role: string) {
    const whereClause = role === 'PROVIDER' ? { providerId: userId } : { consumerId: userId };
    return prisma.appointment.findMany({
      where: whereClause,
      include: {
        consumer: { include: { profile: true } },
        provider: { include: { profile: true, providerProfile: true } },
        charts: true
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.appointment.update({
      where: { id },
      data: { status }
    });
  }
}

export const appointmentRepository = new AppointmentRepository();
