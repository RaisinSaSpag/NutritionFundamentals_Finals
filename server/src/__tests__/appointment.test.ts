import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Appointments & Video Consultation Endpoints', () => {
  let providerToken: string;
  let providerId: string;
  let consumerToken: string;
  let otherConsumerToken: string;
  let appointmentId: string;
  let bookingDate: string;

  beforeAll(async () => {
    // 1. Provider
    const pLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dietitian@telenutrition.demo', password: 'Password123!' });
    providerToken = pLogin.body.token;
    providerId = pLogin.body.user.id;

    // 2. Consumer (Alex)
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.healthy@telenutrition.demo', password: 'Password123!' });
    consumerToken = cLogin.body.token;

    // 3. Other Consumer (Clara)
    const oLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'clara.hypertension@telenutrition.demo', password: 'Password123!' });
    otherConsumerToken = oLogin.body.token;

    // Generate a unique slot time to avoid collisions across test runs
    const slotTime = new Date(Date.now() + 86400000 * 10 + Math.floor(Math.random() * 10000000));
    slotTime.setSeconds(0, 0);
    bookingDate = slotTime.toISOString();
  });

  it('allows consumer to book an available appointment slot', async () => {
    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        providerId,
        scheduledAt: bookingDate,
        durationMinutes: 30,
        notes: 'Consultation for athletic marathon nutrition.'
      });

    expect(res.status).toBe(201);
    expect(res.body.appointment).toBeDefined();
    expect(res.body.appointment.status).toBe('SCHEDULED');
    expect(res.body.appointment.roomName).toContain('telenutrition-');

    appointmentId = res.body.appointment.id;
  });

  it('prevents double-booking the same provider slot with 409', async () => {
    // Attempting to book the identical slot by another consumer
    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${otherConsumerToken}`)
      .send({
        providerId,
        scheduledAt: bookingDate,
        durationMinutes: 30
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already booked');
  });

  it('lists appointments for authenticated consumer and provider', async () => {
    const cRes = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(cRes.status).toBe(200);
    expect(cRes.body.appointments.some((a: any) => a.id === appointmentId)).toBe(true);

    const pRes = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(pRes.status).toBe(200);
    expect(pRes.body.appointments.some((a: any) => a.id === appointmentId)).toBe(true);
  });

  it('unlocks secure session room link for appointment participants and transitions to IN_PROGRESS', async () => {
    const res = await request(app)
      .get(`/api/appointments/${appointmentId}/room`)
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.session.roomName).toBeDefined();
    expect(res.body.session.domain).toBe('meet.jit.si');
    expect(res.body.session.status).toBe('IN_PROGRESS');
  });

  it('blocks non-participant consumer from joining video room', async () => {
    const res = await request(app)
      .get(`/api/appointments/${appointmentId}/room`)
      .set('Authorization', `Bearer ${otherConsumerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access denied');
  });

  it('updates appointment status to COMPLETED after session', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.appointment.status).toBe('COMPLETED');
  });
});
