import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { getAge5YearBand } from '../services/anonymization.service';

describe('Data Privacy, PII Anonymization & EHR Integration Endpoints', () => {
  let providerToken: string;
  let consumerToken: string;

  beforeAll(async () => {
    const pLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dietitian@telenutrition.demo', password: 'Password123!' });
    providerToken = pLogin.body.token;

    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan.diabetes@telenutrition.demo', password: 'Password123!' });
    consumerToken = cLogin.body.token;
  });

  it('correctly maps numeric ages to 5-year bands', () => {
    expect(getAge5YearBand(24)).toBe('20-24');
    expect(getAge5YearBand(30)).toBe('30-34');
    expect(getAge5YearBand(48)).toBe('45-49');
    expect(getAge5YearBand(61)).toBe('60-64');
  });

  it('exports de-identified records with PII strictly removed', async () => {
    const res = await request(app)
      .get('/api/export/anonymized')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metadata).toBeDefined();
    expect(res.body.subjects.length).toBeGreaterThanOrEqual(3);

    const firstSubject = res.body.subjects[0];

    // Verify research ID format
    expect(firstSubject.researchSubjectId).toMatch(/^SUBJ-\d{4}$/);

    // Verify PII fields are NOT present
    expect((firstSubject as any).firstName).toBeUndefined();
    expect((firstSubject as any).lastName).toBeUndefined();
    expect((firstSubject as any).email).toBeUndefined();
    expect((firstSubject as any).phone).toBeUndefined();
    expect((firstSubject as any).dateOfBirth).toBeUndefined();

    // Verify demographics have ageBand
    expect(firstSubject.demographics.ageBand).toMatch(/^\d+-\d+$/);

    // Verify meal dates are generalized to relative study days
    if (firstSubject.loggedMealsSummary.length > 0) {
      expect(firstSubject.loggedMealsSummary[0].studyDay).toMatch(/^Day \d+$/);
    }
  });

  it('rejects consumer attempts to access de-identified export with 403', async () => {
    const res = await request(app)
      .get('/api/export/anonymized')
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access denied');
  });

  it('handles offline EHR gateway by returning an error instead of fake clinical data', async () => {
    const res = await request(app)
      .get('/api/export/ehr/observations/test-patient-id')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
