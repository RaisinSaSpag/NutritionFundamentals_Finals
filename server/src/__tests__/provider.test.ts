import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Provider Dashboard & eNCPT ADIME Charting Endpoints', () => {
  let providerToken: string;
  let consumerToken: string;
  let juanConsumerId: string;
  let alexConsumerId: string;

  beforeAll(async () => {
    // 1. Provider login (Maria Santos, RDN)
    const pLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'dietitian@telenutrition.demo',
        password: 'Password123!'
      });
    providerToken = pLogin.body.token;

    // 2. Consumer 1 login (Juan - has appointment)
    const cLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan.diabetes@telenutrition.demo',
        password: 'Password123!'
      });
    consumerToken = cLogin.body.token;
    juanConsumerId = cLogin.body.user.id;

    // 3. Unbooked consumer (brand new user who has never booked with Maria)
    const uniqueEmail = `stranger.${Date.now()}@telenutrition.demo`;
    const strangerLogin = await request(app)
      .post('/api/auth/register/consumer')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
        firstName: 'Stranger',
        lastName: 'Patient',
        dateOfBirth: '1995-05-05',
        healthProfile: {
          sex: 'FEMALE',
          heightCm: 165,
          weightKg: 60,
          activityLevel: 'SEDENTARY'
        }
      });
    alexConsumerId = strangerLogin.body.user.id;
  });

  it('lists provider consumers who have appointments', async () => {
    const res = await request(app)
      .get('/api/provider/consumers')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.consumers.length).toBeGreaterThan(0);
    const ids = res.body.consumers.map((c: any) => c.id);
    expect(ids).toContain(juanConsumerId);
  });

  it('fetches consumer clinical detail including profile, CDS alerts, and past records', async () => {
    const res = await request(app)
      .get(`/api/provider/consumers/${juanConsumerId}`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    const consumer = res.body.consumer;
    expect(consumer.email).toBe('juan.diabetes@telenutrition.demo');
    expect(consumer.healthProfile).toBeDefined();
    expect(consumer.cdsAlerts).toBeDefined();
  });

  it('blocks provider from viewing consumer who has not booked with them', async () => {
    const res = await request(app)
      .get(`/api/provider/consumers/${alexConsumerId}`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access denied');
  });

  it('allows provider to create, edit, and finalize an eNCPT ADIME chart with PES statement', async () => {
    // Step A: Create Draft Chart
    const createRes = await request(app)
      .post('/api/provider/charts')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        consumerId: juanConsumerId,
        assessmentFoodNutritionHistory: 'Consistently consumes 2 cups white rice per meal and salty sauces.',
        assessmentAnthropometrics: JSON.stringify({ heightCm: 172, weightKg: 84.5, bmi: 28.56 }),
        assessmentBiochemical: JSON.stringify([{ test: 'HbA1c', value: '7.4%' }]),
        assessmentPhysicalFindings: 'No acanthosis nigricans observed.',
        assessmentClientHistory: 'Type 2 Diabetes for 3 years.',
        diagnosisDomain: 'INTAKE',
        diagnosisTerm: 'Excessive carbohydrate intake (NI-5.8.2)',
        diagnosisEtiology: 'habitual consumption of refined rice and sweetened beverages',
        diagnosisSignsSymptoms: 'fasting blood glucose of 145 mg/dL and HbA1c of 7.4%',
        interventionFoodDelivery: 'Portion control: reduce white rice to 1 cup per meal; introduce brown rice.',
        interventionEducation: 'Plate method and carbohydrate counting education.',
        interventionCounseling: 'Goal setting for gradual carbohydrate reduction.',
        interventionCoordination: 'Coordinate medication timing with primary endocrinologist.',
        meIndicators: 'HbA1c, self-monitored fasting blood glucose.',
        meTargets: 'Fasting glucose < 120 mg/dL, HbA1c < 7.0% at 3 months.'
      });

    expect(createRes.status).toBe(201);
    const chart = createRes.body.chart;
    expect(chart.status).toBe('DRAFT');
    expect(chart.pesStatement).toContain('Excessive carbohydrate intake');
    expect(chart.pesStatement).toContain('related to');
    expect(chart.pesStatement).toContain('as evidenced by');

    const chartId = chart.id;

    // Step B: Edit Draft Chart
    const editRes = await request(app)
      .put(`/api/provider/charts/${chartId}`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        diagnosisTerm: 'Excessive carbohydrate intake (NI-5.8.2)',
        diagnosisEtiology: 'habitual consumption of refined rice, sweetened coffee, and snack pastries',
        diagnosisSignsSymptoms: 'fasting blood glucose of 145 mg/dL and HbA1c of 7.4%'
      });

    expect(editRes.status).toBe(200);
    expect(editRes.body.chart.pesStatement).toContain('sweetened coffee');

    // Step C: Finalize and Lock Chart
    const finalizeRes = await request(app)
      .post(`/api/provider/charts/${chartId}/finalize`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(finalizeRes.status).toBe(200);
    expect(finalizeRes.body.chart.status).toBe('FINALIZED');
    expect(finalizeRes.body.chart.finalizedAt).toBeDefined();

    // Step D: Attempting to edit a finalized chart must fail with 400
    const failEditRes = await request(app)
      .put(`/api/provider/charts/${chartId}`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        assessmentPhysicalFindings: 'Late update should be rejected.'
      });

    expect(failEditRes.status).toBe(400);
    expect(failEditRes.body.error).toContain('Cannot edit a finalized/locked ADIME chart');
  });
});
