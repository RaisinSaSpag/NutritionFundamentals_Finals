import { ActivityLevel, EnergyNeedsResult } from '../types/health.types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9
};

/**
 * Calculates Total Energy Expenditure (TEE) = BMR * Physical Activity Level (PAL)
 */
export function calculateTee(bmr: number, activityLevel: ActivityLevel): EnergyNeedsResult {
  if (bmr <= 0 || isNaN(bmr)) {
    throw new Error('BMR must be a positive number greater than 0');
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.SEDENTARY;
  const rawTee = bmr * multiplier;
  const tee = Math.round(rawTee);

  return {
    bmr,
    tee,
    activityLevel,
    activityMultiplier: multiplier
  };
}
