import { describe, it, expect } from 'vitest';
import { getRdaTargets, calculateMacronutrientPercentages } from '../../domain/rda';

describe('Domain: RDA Targets & AMDR Calculation', () => {
  // Hand Calculation 1: 70kg Male Adult
  // Protein = 70 * 0.8 = 56.0 g/day
  // Fiber = 38 g/day
  // Sodium UL = 2300 mg/day
  // Potassium AI = 3400 mg/day
  // Calcium = 1000 mg/day
  // Iron = 8 mg/day
  // Vitamin C = 90 mg/day
  it('calculates RDA targets for 70kg adult male correctly', () => {
    const targets = getRdaTargets(70, 35, 'MALE');
    expect(targets.proteinGrams).toBe(56.0);
    expect(targets.fiberGrams).toBe(38);
    expect(targets.sodiumMaxMg).toBe(2300);
    expect(targets.potassiumMg).toBe(3400);
    expect(targets.calciumMg).toBe(1000);
    expect(targets.ironMg).toBe(8);
    expect(targets.vitaminCMg).toBe(90);
  });

  // Hand Calculation 2: 60kg Female Adult, Age 55 (Postmenopausal)
  // Protein = 60 * 0.8 = 48.0 g/day
  // Fiber = 25 g/day
  // Calcium = 1200 mg/day (Adjusted upward for age >= 51)
  // Iron = 8 mg/day (Adjusted downward for postmenopausal age >= 51)
  // Vitamin C = 75 mg/day
  it('adjusts calcium and iron for postmenopausal females (51+)', () => {
    const targets = getRdaTargets(60, 55, 'FEMALE');
    expect(targets.proteinGrams).toBe(48.0);
    expect(targets.fiberGrams).toBe(25);
    expect(targets.calciumMg).toBe(1200);
    expect(targets.ironMg).toBe(8);
    expect(targets.vitaminCMg).toBe(75);
  });

  // Hand Calculation 3: AMDR Percentages
  // Intake: 75g protein (300 kcal), 250g carbs (1000 kcal), 50g fat (450 kcal)
  // Total = 1750 kcal
  // Protein % = 300 / 1750 = 17.14% -> 17%
  // Carbs % = 1000 / 1750 = 57.14% -> 57%
  // Fat % = 450 / 1750 = 25.71% -> 26%
  it('calculates AMDR energy distribution percentages correctly', () => {
    const macro = calculateMacronutrientPercentages(75, 250, 50, 1750);
    expect(macro.proteinPct).toBe(17);
    expect(macro.carbsPct).toBe(57);
    expect(macro.fatPct).toBe(26);
  });

  it('handles zero total calories safely', () => {
    const macro = calculateMacronutrientPercentages(0, 0, 0, 0);
    expect(macro).toEqual({ proteinPct: 0, carbsPct: 0, fatPct: 0 });
  });

  it('throws an error for non-positive weight or negative age', () => {
    expect(() => getRdaTargets(0, 25, 'MALE')).toThrow('Weight must be positive');
    expect(() => getRdaTargets(70, -1, 'MALE')).toThrow('Age must be non-negative');
  });
});
