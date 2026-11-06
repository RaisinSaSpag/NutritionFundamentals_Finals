import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Meal Logging & Consumer Profile Endpoints', () => {
  let consumerToken: string;
  let foodItems: any[];

  beforeAll(async () => {
    // Login as Juan Dela Cruz (Diabetic Consumer)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan.diabetes@telenutrition.demo',
        password: 'Password123!'
      });

    consumerToken = loginRes.body.token;

    // Fetch food items
    const foodsRes = await request(app)
      .get('/api/meals/foods')
      .set('Authorization', `Bearer ${consumerToken}`);

    foodItems = foodsRes.body.foods;
  });

  it('retrieves seeded food items including Filipino dishes', async () => {
    expect(foodItems.length).toBeGreaterThanOrEqual(40);
    const names = foodItems.map((f: any) => f.name);
    expect(names.some((n: string) => n.includes('Adobo'))).toBe(true);
    expect(names.some((n: string) => n.includes('Sinigang'))).toBe(true);
    expect(names.some((n: string) => n.includes('Rice'))).toBe(true);
    expect(names.some((n: string) => n.includes('Pandesal'))).toBe(true);
    expect(names.some((n: string) => n.includes('Banana'))).toBe(true);
  });

  it('searches food items by keyword', async () => {
    const res = await request(app)
      .get('/api/meals/foods?q=adobo')
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.foods.length).toBeGreaterThan(0);
    expect(res.body.foods[0].name).toContain('Adobo');
  });

  it('logs a new meal and returns created record with food items', async () => {
    const adobo = foodItems.find((f: any) => f.name.includes('Adobo'));
    const rice = foodItems.find((f: any) => f.name.includes('White Rice'));

    const todayStr = new Date().toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/meals/log')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        date: todayStr,
        mealType: 'DINNER',
        notes: 'Delicious adobo dinner with rice',
        items: [
          { foodItemId: adobo.id, servings: 1.5 },
          { foodItemId: rice.id, servings: 2.0 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.meal).toBeDefined();
    expect(res.body.meal.items.length).toBe(2);
    expect(res.body.meal.mealType).toBe('DINNER');
  });

  it('fetches comprehensive nutrition analytics with daily totals, 7-day trend, and CDS alerts', async () => {
    const res = await request(app)
      .get('/api/meals/analytics')
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(res.status).toBe(200);
    const analytics = res.body.analytics;

    // Computed patient metrics
    expect(analytics.profile.bmi).toBeGreaterThan(0);
    expect(analytics.profile.bmr).toBeGreaterThan(0);
    expect(analytics.profile.tee).toBeGreaterThan(0);

    // 7-day trend array for Recharts
    expect(analytics.sevenDayTrend).toBeDefined();
    expect(analytics.sevenDayTrend.length).toBe(7);

    // Macronutrient distribution
    expect(analytics.macroPercentages).toBeDefined();

    // CDS alerts triggered (e.g. Sodium/Carb for diabetic patient)
    expect(analytics.activeAlerts).toBeDefined();
    expect(analytics.activeAlerts.length).toBeGreaterThan(0);
  });

  it('retrieves consumer profile with computed health metrics', async () => {
    const res = await request(app)
      .get('/api/consumer/profile')
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(res.status).toBe(200);
    const profile = res.body.profile;
    expect(profile.email).toBe('juan.diabetes@telenutrition.demo');
    expect(profile.computedMetrics.bmi).toBeGreaterThan(0);
    expect(profile.computedMetrics.bmiCategory).toBeDefined();
    expect(profile.computedMetrics.tee).toBeGreaterThan(0);
  });

  it('updates consumer health profile and appends to weight history', async () => {
    const res = await request(app)
      .put('/api/consumer/profile')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        weightKg: 83.5,
        activityLevel: 'LIGHT',
        nutritionGoals: 'Lower blood sugar, increase morning walks'
      });

    expect(res.status).toBe(200);

    // Check weight history updated
    const historyRes = await request(app)
      .get('/api/consumer/weight-history')
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(historyRes.status).toBe(200);
    const latest = historyRes.body.weightHistory.pop();
    expect(latest.weightKg).toBe(83.5);
  });
});
