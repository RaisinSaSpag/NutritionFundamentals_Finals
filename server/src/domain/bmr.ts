import { BmrResult, Sex } from '../types/health.types';

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * Source: Mifflin MD, St Jeor ST, et al. Am J Clin Nutr. 1990;51(2):241-247.
 *
 * Formulas:
 * Male:   10 * weight (kg) + 6.25 * height (cm) - 5 * age (years) + 5
 * Female: 10 * weight (kg) + 6.25 * height (cm) - 5 * age (years) - 161
 * Other:  Uses average constant (-78)
 */
export function calculateBmr(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: Sex
): BmrResult {
  if (weightKg <= 0 || isNaN(weightKg)) {
    throw new Error('Weight must be a positive number greater than 0');
  }
  if (heightCm <= 0 || isNaN(heightCm)) {
    throw new Error('Height must be a positive number greater than 0');
  }
  if (ageYears < 0 || isNaN(ageYears)) {
    throw new Error('Age must be a non-negative number');
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  let offset = 5;

  if (sex === 'FEMALE') {
    offset = -161;
  } else if (sex === 'OTHER') {
    offset = -78; // Neutral midpoint between male (+5) and female (-161)
  }

  const rawBmr = base + offset;
  const bmr = Math.round(rawBmr * 10) / 10;

  return {
    bmr,
    formula: 'Mifflin-St Jeor'
  };
}
