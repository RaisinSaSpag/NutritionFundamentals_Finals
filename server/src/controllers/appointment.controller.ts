import { Response, NextFunction } from 'express';
import { appointmentService, AppointmentService } from '../services/appointment.service';
import { AuthenticatedRequest } from '../types/auth.types';

export class AppointmentController {
  constructor(private service: AppointmentService = appointmentService) {}

  bookAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consumerId = req.user!.userId;
      const appointment = await this.service.bookAppointment(consumerId, req.body);
      res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (err) {
      next(err);
    }
  };

  getMyAppointments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const appointments = await this.service.getUserAppointments(userId, role);
      res.json({ appointments });
    } catch (err) {
      next(err);
    }
  };

  getAppointmentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appt = await this.service.getAppointmentById(req.params.id, req.user!.userId, req.user!.role);
      res.json({ appointment: appt });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.service.updateAppointmentStatus(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        req.body.status
      );
      res.json({ message: 'Appointment status updated', appointment: updated });
    } catch (err) {
      next(err);
    }
  };

  getSessionRoom = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const room = await this.service.getSessionRoom(req.params.id, req.user!.userId, req.user!.role);
      res.json({ session: room });
    } catch (err) {
      next(err);
    }
  };
}

export const appointmentController = new AppointmentController();
