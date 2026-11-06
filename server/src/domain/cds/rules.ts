export type CdsSeverity = 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL' | 'FLAG';

export interface CdsAlertResult {
  ruleId: string;
  severity: CdsSeverity;
  message: string;
}

// 1. Sodium > 2,300 mg/day -> warning (stronger if patient has hypertension or CKD)
export function rule1_sodiumExcess(
  dailySodiumMg: number,
  medicalConditions: string[] = []
): CdsAlertResult | null {
  const isHighRisk = medicalConditions.includes('HYPERTENSION') || medicalConditions.includes('CKD');
  const threshold = isHighRisk ? 2000 : 2300;

  if (dailySodiumMg > threshold) {
    return {
      ruleId: 'CDS-RULE-1-SODIUM',
      severity: isHighRisk ? 'ALERT' : 'WARNING',
      message: isHighRisk
        ? `Daily sodium intake (${dailySodiumMg} mg) exceeds the therapeutic limit of ${threshold} mg for patients with ${medicalConditions.join('/')}. Strict sodium reduction recommended.`
        : `Daily sodium intake (${dailySodiumMg} mg) exceeds the recommended limit of 2,300 mg/day.`
    };
  }
  return null;
}

// 2. Calories < BMR for 3 consecutive days -> alert for possible under-eating
export function rule2_consecutiveCalorieDeficit(
  dailyCaloriesLast3Days: number[],
  bmr: number
): CdsAlertResult | null {
  if (dailyCaloriesLast3Days.length < 3 || bmr <= 0) return null;

  const allBelowBmr = dailyCaloriesLast3Days.slice(0, 3).every((cal) => cal > 0 && cal < bmr);
  if (allBelowBmr) {
    return {
      ruleId: 'CDS-RULE-2-UNDER-EATING',
      severity: 'ALERT',
      message: `Calorie intake has fallen below basal metabolic needs (${bmr} kcal) for 3 consecutive days. Flagged for risk of under-eating and metabolic deceleration.`
    };
  }
  return null;
}

// 3. Protein < RDA -> warning
export function rule3_proteinDeficiency(
  dailyProteinGrams: number,
  proteinRdaGrams: number
): CdsAlertResult | null {
  if (dailyProteinGrams < proteinRdaGrams && proteinRdaGrams > 0) {
    return {
      ruleId: 'CDS-RULE-3-PROTEIN-DEFICIT',
      severity: 'WARNING',
      message: `Daily protein intake (${dailyProteinGrams}g) is below the minimum RDA requirement (${proteinRdaGrams}g). Increase lean protein intake to preserve lean muscle mass.`
    };
  }
  return null;
}

// 4. Carbohydrate > 65% of energy for a diabetic patient -> warning
export function rule4_diabeticHighCarb(
  carbsPercent: number,
  isDiabetic: boolean
): CdsAlertResult | null {
  if (isDiabetic && carbsPercent > 65) {
    return {
      ruleId: 'CDS-RULE-4-DIABETIC-CARB-HIGH',
      severity: 'WARNING',
      message: `Carbohydrate intake is ${carbsPercent}% of total daily energy, exceeding the 65% ceiling. In diabetic management, this may precipitate postprandial hyperglycemia.`
    };
  }
  return null;
}

// 5. Potassium high for a CKD patient -> alert
export function rule5_ckdHighPotassium(
  dailyPotassiumMg: number,
  hasCkd: boolean
): CdsAlertResult | null {
  // Clinical renal guideline: restrict potassium to < 2,000-2,500 mg in CKD stage 3b-5
  const CKD_POTASSIUM_CEILING = 2500;
  if (hasCkd && dailyPotassiumMg > CKD_POTASSIUM_CEILING) {
    return {
      ruleId: 'CDS-RULE-5-CKD-POTASSIUM-HIGH',
      severity: 'ALERT',
      message: `Daily potassium (${dailyPotassiumMg} mg) exceeds the 2,500 mg safety threshold for Chronic Kidney Disease (CKD). Risk of hyperkalemia and cardiac arrhythmia.`
    };
  }
  return null;
}

// 6. Fiber < recommended -> info
export function rule6_inadequateFiber(
  dailyFiberGrams: number,
  fiberRdaGrams: number
): CdsAlertResult | null {
  if (dailyFiberGrams < fiberRdaGrams && fiberRdaGrams > 0) {
    return {
      ruleId: 'CDS-RULE-6-FIBER-LOW',
      severity: 'INFO',
      message: `Fiber intake (${dailyFiberGrams}g) is below the recommended DRI of ${fiberRdaGrams}g/day. Consider adding whole grains, legumes, and fresh vegetables.`
    };
  }
  return null;
}

// 7. BMI < 18.5 or >= 30 -> flag for a dietitian referral
export function rule7_dietitianReferralBmi(
  bmi: number,
  useAsianPacific = false
): CdsAlertResult | null {
  const obesityThreshold = useAsianPacific ? 27.5 : 30.0;
  if (bmi < 18.5 || bmi >= obesityThreshold) {
    return {
      ruleId: 'CDS-RULE-7-BMI-REFERRAL',
      severity: 'FLAG',
      message: bmi < 18.5
        ? `BMI of ${bmi} indicates underweight status. Priority referral to a Registered Dietitian for malnutrition screening.`
        : `BMI of ${bmi} meets clinical criteria for obesity (${useAsianPacific ? 'Asian-Pacific >=27.5' : 'WHO >=30.0'}). Dietitian referral recommended for medical nutrition therapy.`
    };
  }
  return null;
}

// 8. Logged food contains a declared allergen -> critical alert
export function rule8_allergenExposure(
  loggedAllergens: string[],
  userDeclaredAllergies: string[]
): CdsAlertResult | null {
  const normalizedUserAllergies = userDeclaredAllergies.map((a) => a.toLowerCase().trim());
  const matched = loggedAllergens.filter((allergen) =>
    normalizedUserAllergies.includes(allergen.toLowerCase().trim())
  );

  if (matched.length > 0) {
    return {
      ruleId: 'CDS-RULE-8-ALLERGEN-DETECTED',
      severity: 'CRITICAL',
      message: `CRITICAL ALERT: Logged meal contains declared allergen(s): ${[...new Set(matched)].join(', ')}. Review ingredients immediately.`
    };
  }
  return null;
}

// 9. Rapid weight change (>5% in 30 days) -> flag
export function rule9_rapidWeightChange(
  currentWeightKg: number,
  weight30DaysAgoKg: number | null
): CdsAlertResult | null {
  if (!weight30DaysAgoKg || weight30DaysAgoKg <= 0 || currentWeightKg <= 0) return null;

  const percentChange = Math.abs((currentWeightKg - weight30DaysAgoKg) / weight30DaysAgoKg) * 100;
  if (percentChange > 5.0) {
    const direction = currentWeightKg > weight30DaysAgoKg ? 'gain' : 'loss';
    return {
      ruleId: 'CDS-RULE-9-RAPID-WEIGHT-CHANGE',
      severity: 'FLAG',
      message: `Rapid weight ${direction} detected (${percentChange.toFixed(1)}% change in 30 days: ${weight30DaysAgoKg}kg to ${currentWeightKg}kg). Warranting clinical evaluation.`
    };
  }
  return null;
}

// 10. No meals logged for 3+ days -> adherence reminder
export function rule10_mealLoggingAdherence(
  daysSinceLastMealLog: number
): CdsAlertResult | null {
  if (daysSinceLastMealLog >= 3) {
    return {
      ruleId: 'CDS-RULE-10-LOGGING-ADHERENCE',
      severity: 'INFO',
      message: `No meals have been logged for ${daysSinceLastMealLog} consecutive days. Consistent tracking is key to personalized nutrition feedback.`
    };
  }
  return null;
}
