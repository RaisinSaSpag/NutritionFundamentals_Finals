import { Sex } from '../types/health.types';
import {
  MICRONUTRIENT_DRI_TABLE,
  PROTEIN_RDA_PER_KG
} from './constants/rda.constants';

export interface CalculatedRdaTargets {
  proteinGrams: number;
  fiberGrams: number;
  sodiumMaxMg: number;
  potassiumMg: number;
  calciumMg: number;
  ironMg: number;
  vitaminCMg: number;
}

export interface DailyNutrientIntake {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  potassium: number;
}

export function getRdaTargets(
  weightKg: number,
  ageYears: number,
  sex: Sex
): CalculatedRdaTargets {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  if (ageYears < 0) throw new Error('Age must be non-negative');

  const baselineProtein = Math.round(weightKg * PROTEIN_RDA_PER_KG * 10) / 10;
  const sexKey = sex === 'FEMALE' ? 'FEMALE' : 'MALE';
  const table = MICRONUTRIENT_DRI_TABLE[sexKey];

  // Adjust calcium for females 51+ to 1200 mg
  const calciumMg = sex === 'FEMALE' && ageYears >= 51 ? 1200 : table.calcium;
  // Adjust iron for females 51+ to 8 mg
  const ironMg = sex === 'FEMALE' && ageYears >= 51 ? 8 : table.iron;

  return {
    proteinGrams: baselineProtein,
    fiberGrams: table.fiber,
    sodiumMaxMg: table.sodiumUl,
    potassiumMg: table.potassium,
    calciumMg,
    ironMg,
    vitaminCMg: table.vitaminC
  };
}

export function calculateMacronutrientPercentages(
  proteinG: number,
  carbsG: number,
  fatG: number,
  totalCalories: number
) {
  if (totalCalories <= 0) {
    return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
  }
  // 4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat
  const proteinKcal = proteinG * 4;
  const carbsKcal = carbsG * 4;
  const fatKcal = fatG * 9;

  return {
    proteinPct: Math.round((proteinKcal / totalCalories) * 100),
    carbsPct: Math.round((carbsKcal / totalCalories) * 100),
    fatPct: Math.round((fatKcal / totalCalories) * 100)
  };
}
