import { appointmentRepository, AppointmentRepository } from '../repositories/appointment.repository';

export class AppointmentService {
  constructor(private repo: AppointmentRepository = appointmentRepository) {}

  async bookAppointment(consumerId: string, data: { providerId: string; scheduledAt: string; durationMinutes?: number; notes?: string }) {
    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw { statusCode: 400, message: 'Invalid appointment scheduledAt timestamp.' };
    }

    // Service-level double booking check
    const isBooked = await this.repo.isProviderBooked(data.providerId, scheduledDate);
    if (isBooked) {
      throw { statusCode: 409, message: 'This provider slot is already booked. Please select another time.' };
    }

    return this.repo.createAppointment({
      consumerId,
      providerId: data.providerId,
      scheduledAt: scheduledDate,
      durationMinutes: data.durationMinutes,
      notes: data.notes
    });
  }

  async getUserAppointments(userId: string, role: string) {
    return this.repo.getAppointmentsForUser(userId, role);
  }

  async getAppointmentById(id: string, userId: string, role: string) {
    const appt = await this.repo.findById(id);
    if (!appt) {
      throw { statusCode: 404, message: 'Appointment not found.' };
    }

    // Security check: only participants can view
    if (role === 'CONSUMER' && appt.consumerId !== userId) {
      throw { statusCode: 403, message: 'Access denied.' };
    }
    if (role === 'PROVIDER' && appt.providerId !== userId) {
      throw { statusCode: 403, message: 'Access denied.' };
    }

    return appt;
  }

  async updateAppointmentStatus(id: string, userId: string, role: string, status: string) {
    const appt = await this.getAppointmentById(id, userId, role);

    if (!['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      throw { statusCode: 400, message: 'Invalid appointment status.' };
    }

    return this.repo.updateStatus(appt.id, status);
  }

  async getSessionRoom(id: string, userId: string, role: string) {
    const appt = await this.getAppointmentById(id, userId, role);

    const now = new Date();
    const scheduled = new Date(appt.scheduledAt);
    const tenMinutesBefore = new Date(scheduled.getTime() - 10 * 60 * 1000);
    const sessionEndTime = new Date(scheduled.getTime() + (appt.durationMinutes + 30) * 60 * 1000);

    // Allow access if session is IN_PROGRESS, or within 10 minutes of start time, or in development mode
    const isWithinWindow = (now >= tenMinutesBefore && now <= sessionEndTime) || appt.status === 'IN_PROGRESS' || process.env.NODE_ENV !== 'production';

    if (!isWithinWindow && appt.status === 'SCHEDULED') {
      const waitMinutes = Math.ceil((tenMinutesBefore.getTime() - now.getTime()) / 60000);
      throw {
        statusCode: 403,
        message: `Video room opens 10 minutes before session. Please return in ${waitMinutes} minutes.`
      };
    }

    // If starting now, auto-update to IN_PROGRESS
    if (appt.status === 'SCHEDULED') {
      await this.repo.updateStatus(appt.id, 'IN_PROGRESS');
    }

    return {
      appointmentId: appt.id,
      roomName: appt.roomName,
      domain: 'meet.jit.si',
      status: 'IN_PROGRESS',
      displayName: role === 'PROVIDER'
        ? `Dietitian ${appt.provider.profile?.lastName || ''}`
        : `${appt.consumer.profile?.firstName || 'Patient'} ${appt.consumer.profile?.lastName || ''}`
    };
  }
}

export const appointmentService = new AppointmentService();
