import { BmiResult } from '../types/health.types';

/**
 * Calculates Body Mass Index (BMI) and assigns standard or Asian-Pacific category.
 * Formula: BMI = weight (kg) / (height (m))²
 *
 * Cutoffs:
 * - Standard WHO:
 *     Underweight: < 18.5
 *     Normal: 18.5 - 24.9
 *     Overweight: 25.0 - 29.9
 *     Obese: >= 30.0
 * - Asian-Pacific (WHO WPRO):
 *     Underweight: < 18.5
 *     Normal: 18.5 - 22.9
 *     Overweight: 23.0 - 27.4
 *     Obese: >= 27.5
 */
export function calculateBmi(
  weightKg: number,
  heightCm: number,
  useAsianPacific = false
): BmiResult {
  if (weightKg <= 0 || isNaN(weightKg)) {
    throw new Error('Weight must be a positive number greater than 0');
  }
  if (heightCm <= 0 || isNaN(heightCm)) {
    throw new Error('Height must be a positive number greater than 0');
  }

  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 100) / 100;

  let category: BmiResult['category'];

  if (useAsianPacific) {
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 23.0) category = 'Normal';
    else if (bmi < 27.5) category = 'Overweight';
    else category = 'Obese';
  } else {
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25.0) category = 'Normal';
    else if (bmi < 30.0) category = 'Overweight';
    else category = 'Obese';
  }

  return { bmi, category, isAsianPacific: useAsianPacific };
}
