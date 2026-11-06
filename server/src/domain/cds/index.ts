import {
  CdsAlertResult,
  rule1_sodiumExcess,
  rule2_consecutiveCalorieDeficit,
  rule3_proteinDeficiency,
  rule4_diabeticHighCarb,
  rule5_ckdHighPotassium,
  rule6_inadequateFiber,
  rule7_dietitianReferralBmi,
  rule8_allergenExposure,
  rule9_rapidWeightChange,
  rule10_mealLoggingAdherence
} from './rules';

export interface CdsEvaluationInput {
  bmi: number;
  bmr: number;
  useAsianPacificBmi?: boolean;
  medicalConditions: string[];
  allergies: string[];
  currentWeightKg: number;
  weight30DaysAgoKg: number | null;
  daysSinceLastMealLog: number;
  latestDailyIntake?: {
    calories: number;
    protein: number;
    carbsPct: number;
    fiber: number;
    sodium: number;
    potassium: number;
    allergens: string[];
  };
  caloriesLast3Days?: number[];
  proteinRdaGrams: number;
  fiberRdaGrams: number;
}

export function evaluateCdsRules(input: CdsEvaluationInput): CdsAlertResult[] {
  const alerts: CdsAlertResult[] = [];

  const addIf = (res: CdsAlertResult | null) => {
    if (res) alerts.push(res);
  };

  // Rule 7: BMI Referral
  addIf(rule7_dietitianReferralBmi(input.bmi, input.useAsianPacificBmi));

  // Rule 9: Rapid Weight Change
  addIf(rule9_rapidWeightChange(input.currentWeightKg, input.weight30DaysAgoKg));

  // Rule 10: Adherence
  addIf(rule10_mealLoggingAdherence(input.daysSinceLastMealLog));

  // Intake-based rules
  if (input.latestDailyIntake) {
    const intake = input.latestDailyIntake;
    const isDiabetic = input.medicalConditions.includes('DIABETES');
    const hasCkd = input.medicalConditions.includes('CKD');

    addIf(rule1_sodiumExcess(intake.sodium, input.medicalConditions));
    addIf(rule3_proteinDeficiency(intake.protein, input.proteinRdaGrams));
    addIf(rule4_diabeticHighCarb(intake.carbsPct, isDiabetic));
    addIf(rule5_ckdHighPotassium(intake.potassium, hasCkd));
    addIf(rule6_inadequateFiber(intake.fiber, input.fiberRdaGrams));
    addIf(rule8_allergenExposure(intake.allergens, input.allergies));
  }

  // Rule 2: Consecutive Calorie Deficit
  if (input.caloriesLast3Days && input.caloriesLast3Days.length >= 3) {
    addIf(rule2_consecutiveCalorieDeficit(input.caloriesLast3Days, input.bmr));
  }

  return alerts;
}

export * from './rules';
