import { describe, it, expect } from 'vitest';
import { calculateBmi } from '../../domain/bmi';

describe('Domain: BMI Calculation & Classification', () => {
  // Hand Calculation 1: Normal Adult Male
  // Weight = 70.0 kg, Height = 175.0 cm (1.75 m)
  // BMI = 70 / (1.75 * 1.75) = 70 / 3.0625 = 22.8571... -> rounded to 22.86
  // Expected Category (WHO): Normal (18.5 - 24.9)
  it('calculates normal BMI correctly using standard WHO cutoffs', () => {
    const result = calculateBmi(70, 175, false);
    expect(result.bmi).toBe(22.86);
    expect(result.category).toBe('Normal');
    expect(result.isAsianPacific).toBe(false);
  });

  // Hand Calculation 2: Underweight
  // Weight = 45.0 kg, Height = 165.0 cm (1.65 m)
  // BMI = 45 / (1.65 * 1.65) = 45 / 2.7225 = 16.5288... -> rounded to 16.53
  // Expected Category: Underweight (< 18.5)
  it('identifies underweight category correctly', () => {
    const result = calculateBmi(45, 165, false);
    expect(result.bmi).toBe(16.53);
    expect(result.category).toBe('Underweight');
  });

  // Hand Calculation 3: Overweight (WHO standard)
  // Weight = 80.0 kg, Height = 170.0 cm (1.70 m)
  // BMI = 80 / (1.70 * 1.70) = 80 / 2.89 = 27.6816... -> rounded to 27.68
  // Standard WHO: 25.0 - 29.9 -> Overweight
  it('identifies overweight category correctly with WHO cutoffs', () => {
    const result = calculateBmi(80, 170, false);
    expect(result.bmi).toBe(27.68);
    expect(result.category).toBe('Overweight');
  });

  // Hand Calculation 4: Obese WHO standard
  // Weight = 105.0 kg, Height = 175.0 cm (1.75 m)
  // BMI = 105 / 3.0625 = 34.2857... -> rounded to 34.29 (Obese >= 30.0)
  it('identifies obese category correctly with WHO cutoffs', () => {
    const result = calculateBmi(105, 175, false);
    expect(result.bmi).toBe(34.29);
    expect(result.category).toBe('Obese');
  });

  // Hand Calculation 5: Asian-Pacific Cutoff Difference
  // Weight = 72.0 kg, Height = 170.0 cm (1.70 m)
  // BMI = 72 / 2.89 = 24.9134... -> rounded to 24.91
  // Standard WHO: Normal (under 25.0)
  // Asian-Pacific (WHO WPRO): Overweight (23.0 - 27.4)
  it('classifies 24.91 as Overweight under Asian-Pacific cutoffs', () => {
    const standard = calculateBmi(72, 170, false);
    const asian = calculateBmi(72, 170, true);

    expect(standard.bmi).toBe(24.91);
    expect(standard.category).toBe('Normal'); // Below 25.0

    expect(asian.bmi).toBe(24.91);
    expect(asian.category).toBe('Overweight'); // 23.0 - 27.4
    expect(asian.isAsianPacific).toBe(true);
  });

  // Hand Calculation 6: Asian-Pacific Obese threshold
  // Weight = 80.0 kg, Height = 170.0 cm (1.70 m) -> BMI = 27.68
  // Asian-Pacific cutoff for Obese is >= 27.5
  it('classifies BMI >= 27.5 as Obese under Asian-Pacific cutoffs', () => {
    const result = calculateBmi(80, 170, true);
    expect(result.bmi).toBe(27.68);
    expect(result.category).toBe('Obese');
  });

  // Edge cases & invalid inputs
  it('throws an error for zero or negative weight', () => {
    expect(() => calculateBmi(0, 170)).toThrow('Weight must be a positive number');
    expect(() => calculateBmi(-50, 170)).toThrow('Weight must be a positive number');
  });

  it('throws an error for zero or negative height', () => {
    expect(() => calculateBmi(70, 0)).toThrow('Height must be a positive number');
    expect(() => calculateBmi(70, -170)).toThrow('Height must be a positive number');
  });
});
