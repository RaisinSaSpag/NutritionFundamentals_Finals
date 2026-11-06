import { describe, it, expect } from 'vitest';
import { calculateTee, ACTIVITY_MULTIPLIERS } from '../../domain/tee';

describe('Domain: Total Energy Expenditure (TEE)', () => {
  const bmr = 1500; // Reference baseline BMR

  // Hand Calculation 1: Sedentary
  // 1500 * 1.2 = 1800 kcal/day
  it('calculates sedentary TEE correctly', () => {
    const res = calculateTee(bmr, 'SEDENTARY');
    expect(res.tee).toBe(1800);
    expect(res.activityMultiplier).toBe(1.2);
  });

  // Hand Calculation 2: Lightly Active
  // 1500 * 1.375 = 2062.5 -> rounded to 2063 kcal/day
  it('calculates light activity TEE correctly', () => {
    const res = calculateTee(bmr, 'LIGHT');
    expect(res.tee).toBe(2063);
    expect(res.activityMultiplier).toBe(1.375);
  });

  // Hand Calculation 3: Moderately Active
  // 1500 * 1.55 = 2325 kcal/day
  it('calculates moderate activity TEE correctly', () => {
    const res = calculateTee(bmr, 'MODERATE');
    expect(res.tee).toBe(2325);
    expect(res.activityMultiplier).toBe(1.55);
  });

  // Hand Calculation 4: Active
  // 1500 * 1.725 = 2587.5 -> rounded to 2588 kcal/day
  it('calculates active TEE correctly', () => {
    const res = calculateTee(bmr, 'ACTIVE');
    expect(res.tee).toBe(2588);
    expect(res.activityMultiplier).toBe(1.725);
  });

  // Hand Calculation 5: Very Active
  // 1500 * 1.9 = 2850 kcal/day
  it('calculates very active TEE correctly', () => {
    const res = calculateTee(bmr, 'VERY_ACTIVE');
    expect(res.tee).toBe(2850);
    expect(res.activityMultiplier).toBe(1.9);
  });

  it('throws an error for zero or negative BMR', () => {
    expect(() => calculateTee(0, 'SEDENTARY')).toThrow('BMR must be a positive number');
    expect(() => calculateTee(-1200, 'ACTIVE')).toThrow('BMR must be a positive number');
  });
});
