import { describe, it, expect } from 'vitest';
import { calculateBmr } from '../../domain/bmr';

describe('Domain: BMR Mifflin-St Jeor Calculation', () => {
  // Hand Calculation 1: Male Adult
  // Weight = 70 kg, Height = 175 cm, Age = 30 yrs, Sex = MALE
  // Formula: 10 * 70 + 6.25 * 175 - 5 * 30 + 5
  // Base: 700 + 1093.75 - 150 = 1643.75
  // Offset: +5
  // BMR = 1648.75 -> rounded to 1648.8 kcal/day
  it('calculates BMR accurately for adult male', () => {
    const result = calculateBmr(70, 175, 30, 'MALE');
    expect(result.bmr).toBe(1648.8);
    expect(result.formula).toBe('Mifflin-St Jeor');
  });

  // Hand Calculation 2: Female Adult
  // Weight = 60 kg, Height = 160 cm, Age = 28 yrs, Sex = FEMALE
  // Formula: 10 * 60 + 6.25 * 160 - 5 * 28 - 161
  // Base: 600 + 1000 - 140 = 1460
  // Offset: -161
  // BMR = 1460 - 161 = 1299.0 kcal/day
  it('calculates BMR accurately for adult female', () => {
    const result = calculateBmr(60, 160, 28, 'FEMALE');
    expect(result.bmr).toBe(1299);
  });

  // Hand Calculation 3: Neutral Midpoint (OTHER)
  // Weight = 65 kg, Height = 170 cm, Age = 25 yrs
  // Base: 10*65 + 6.25*170 - 5*25 = 650 + 1062.5 - 125 = 1587.5
  // Offset: -78
  // BMR = 1587.5 - 78 = 1509.5 kcal/day
  it('calculates neutral BMR for sex OTHER', () => {
    const result = calculateBmr(65, 170, 25, 'OTHER');
    expect(result.bmr).toBe(1509.5);
  });

  // Edge case: Age 0 (infant baseline)
  it('handles age 0 without error', () => {
    const result = calculateBmr(10, 75, 0, 'MALE');
    // 10*10 + 6.25*75 - 0 + 5 = 100 + 468.75 + 5 = 573.75 -> 573.8
    expect(result.bmr).toBe(573.8);
  });

  // Invalid inputs
  it('throws an error for invalid weight, height, or age', () => {
    expect(() => calculateBmr(-10, 170, 30, 'MALE')).toThrow('Weight must be a positive number');
    expect(() => calculateBmr(70, -170, 30, 'MALE')).toThrow('Height must be a positive number');
    expect(() => calculateBmr(70, 170, -5, 'MALE')).toThrow('Age must be a non-negative number');
  });
});
