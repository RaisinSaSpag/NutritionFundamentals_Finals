import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Authentication & Role Endpoints', () => {
  it('should authenticate provider with valid demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dietitian@telenutrition.demo',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('PROVIDER');
    expect(res.body.user.email).toBe('dietitian@telenutrition.demo');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should authenticate consumer with valid demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan.diabetes@telenutrition.demo',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('CONSUMER');
    expect(res.body.user.profile.firstName).toBe('Juan');
  });

  it('should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dietitian@telenutrition.demo',
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid email or password');
  });

  it('should return 400 for malformed login body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should return current user when authenticated via bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.healthy@telenutrition.demo',
        password: 'Password123!'
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('alex.healthy@telenutrition.demo');
    expect(meRes.body.user.role).toBe('CONSUMER');
  });

  it('should reject unauthenticated request to /api/auth/me with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
