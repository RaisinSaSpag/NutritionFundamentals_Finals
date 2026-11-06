import { describe, it, expect } from 'vitest';
import {
  rule1_sodiumExcess,
  rule2_consecutiveCalorieDeficit,
  rule3_proteinDeficiency,
  rule4_diabeticHighCarb,
  rule5_ckdHighPotassium,
  rule6_inadequateFiber,
  rule7_dietitianReferralBmi,
  rule8_allergenExposure,
  rule9_rapidWeightChange,
  rule10_mealLoggingAdherence,
  evaluateCdsRules
} from '../../domain/cds';

describe('Domain: Clinical Decision Support (CDS) Rules Engine', () => {
  // RULE 1: Sodium Excess
  // Hand Calculation:
  // Non-hypertensive: 2400 mg > 2300 mg -> WARNING
  // Hypertensive/CKD: 2100 mg > 2000 mg -> ALERT
  // Safe intake: 1800 mg <= 2300 mg -> null
  describe('Rule 1: Sodium Intake', () => {
    it('triggers WARNING when sodium > 2,300 mg for general adult', () => {
      const alert = rule1_sodiumExcess(2500, []);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('WARNING');
      expect(alert?.ruleId).toBe('CDS-RULE-1-SODIUM');
    });

    it('triggers ALERT with stricter 2,000 mg threshold for Hypertension/CKD', () => {
      const alert = rule1_sodiumExcess(2100, ['HYPERTENSION']);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('ALERT');
      expect(alert?.message).toContain('exceeds the therapeutic limit of 2000 mg');
    });

    it('returns null for compliant sodium intake (<= 2000/2300 mg)', () => {
      expect(rule1_sodiumExcess(1800, ['HYPERTENSION'])).toBeNull();
      expect(rule1_sodiumExcess(2200, [])).toBeNull();
    });
  });

  // RULE 2: Calories < BMR for 3 consecutive days
  // BMR = 1500 kcal
  // Days: [1200, 1300, 1100] all < 1500 -> ALERT
  // Days: [1200, 1600, 1100] one >= 1500 -> null
  describe('Rule 2: Consecutive Calorie Deficit (< BMR)', () => {
    it('triggers ALERT when intake is below BMR for 3 consecutive days', () => {
      const alert = rule2_consecutiveCalorieDeficit([1200, 1350, 1100], 1500);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('ALERT');
      expect(alert?.ruleId).toBe('CDS-RULE-2-UNDER-EATING');
    });

    it('returns null if any of the 3 days meets or exceeds BMR', () => {
      const alert = rule2_consecutiveCalorieDeficit([1200, 1600, 1100], 1500);
      expect(alert).toBeNull();
    });
  });

  // RULE 3: Protein < RDA
  // RDA = 56g
  // Intake = 40g (< 56g) -> WARNING
  // Intake = 65g (>= 56g) -> null
  describe('Rule 3: Protein Deficiency', () => {
    it('triggers WARNING when protein intake is below RDA', () => {
      const alert = rule3_proteinDeficiency(40, 56);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('WARNING');
      expect(alert?.ruleId).toBe('CDS-RULE-3-PROTEIN-DEFICIT');
    });

    it('returns null when protein meets or exceeds RDA', () => {
      expect(rule3_proteinDeficiency(56, 56)).toBeNull();
      expect(rule3_proteinDeficiency(70, 56)).toBeNull();
    });
  });

  // RULE 4: Carbohydrate > 65% for Diabetic
  // Diabetic + 70% carbs -> WARNING
  // Non-diabetic + 70% carbs -> null
  // Diabetic + 55% carbs -> null
  describe('Rule 4: High Carbohydrate Intake in Diabetes', () => {
    it('triggers WARNING for diabetic patient with carbs > 65%', () => {
      const alert = rule4_diabeticHighCarb(68, true);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('WARNING');
      expect(alert?.ruleId).toBe('CDS-RULE-4-DIABETIC-CARB-HIGH');
    });

    it('returns null for non-diabetic or controlled carb intake', () => {
      expect(rule4_diabeticHighCarb(68, false)).toBeNull();
      expect(rule4_diabeticHighCarb(55, true)).toBeNull();
    });
  });

  // RULE 5: Potassium high for CKD patient (>2,500 mg)
  // CKD + 2800 mg -> ALERT
  // Non-CKD + 3500 mg -> null (healthy AI is 3400 mg)
  describe('Rule 5: High Potassium in CKD', () => {
    it('triggers ALERT for CKD patient with potassium > 2,500 mg', () => {
      const alert = rule5_ckdHighPotassium(2800, true);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('ALERT');
      expect(alert?.ruleId).toBe('CDS-RULE-5-CKD-POTASSIUM-HIGH');
    });

    it('returns null for safe potassium level or non-CKD patient', () => {
      expect(rule5_ckdHighPotassium(2200, true)).toBeNull();
      expect(rule5_ckdHighPotassium(3200, false)).toBeNull();
    });
  });

  // RULE 6: Fiber < recommended
  // Target = 38g, Intake = 18g -> INFO
  describe('Rule 6: Low Dietary Fiber', () => {
    it('triggers INFO when daily fiber is below target', () => {
      const alert = rule6_inadequateFiber(18, 38);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('INFO');
      expect(alert?.ruleId).toBe('CDS-RULE-6-FIBER-LOW');
    });

    it('returns null when fiber target is met', () => {
      expect(rule6_inadequateFiber(38, 38)).toBeNull();
      expect(rule6_inadequateFiber(42, 38)).toBeNull();
    });
  });

  // RULE 7: BMI < 18.5 or >= 30 (or >= 27.5 for Asian-Pacific)
  describe('Rule 7: Dietitian Referral by BMI', () => {
    it('flags referral for underweight BMI < 18.5', () => {
      const alert = rule7_dietitianReferralBmi(17.2);
      expect(alert?.severity).toBe('FLAG');
      expect(alert?.ruleId).toBe('CDS-RULE-7-BMI-REFERRAL');
    });

    it('flags referral for WHO obesity BMI >= 30.0', () => {
      const alert = rule7_dietitianReferralBmi(31.5, false);
      expect(alert?.severity).toBe('FLAG');
    });

    it('flags referral for Asian-Pacific obesity BMI >= 27.5', () => {
      const alert = rule7_dietitianReferralBmi(28.0, true);
      expect(alert?.severity).toBe('FLAG');
    });

    it('returns null for normal weight BMI', () => {
      expect(rule7_dietitianReferralBmi(22.5, false)).toBeNull();
    });
  });

  // RULE 8: Declared allergen detected in logged meal
  // User allergies: ["peanuts", "shellfish"]
  // Meal allergens: ["gluten", "peanuts"] -> CRITICAL
  describe('Rule 8: Allergen Exposure Detection', () => {
    it('triggers CRITICAL alert when meal contains declared allergen', () => {
      const alert = rule8_allergenExposure(['gluten', 'peanuts'], ['peanuts', 'shellfish']);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('CRITICAL');
      expect(alert?.ruleId).toBe('CDS-RULE-8-ALLERGEN-DETECTED');
      expect(alert?.message).toContain('peanuts');
    });

    it('returns null when no allergens match', () => {
      const alert = rule8_allergenExposure(['dairy'], ['peanuts', 'shellfish']);
      expect(alert).toBeNull();
    });
  });

  // RULE 9: Rapid weight change (>5% in 30 days)
  // 30 days ago: 80 kg. Current: 74 kg.
  // Change: |74 - 80| / 80 = 6 / 80 = 7.5% (> 5%) -> FLAG
  describe('Rule 9: Rapid Weight Change (>5% in 30 days)', () => {
    it('triggers FLAG for weight change exceeding 5%', () => {
      const alert = rule9_rapidWeightChange(74, 80); // 7.5% loss
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('FLAG');
      expect(alert?.message).toContain('7.5% change');
    });

    it('returns null for stable weight change (<= 5%)', () => {
      // 80 to 78 kg: |78 - 80| / 80 = 2.5%
      expect(rule9_rapidWeightChange(78, 80)).toBeNull();
    });
  });

  // RULE 10: Adherence reminder (no meals logged for 3+ days)
  describe('Rule 10: Meal Logging Adherence', () => {
    it('triggers INFO reminder when 3 or more days elapsed without log', () => {
      const alert = rule10_mealLoggingAdherence(4);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('INFO');
      expect(alert?.ruleId).toBe('CDS-RULE-10-LOGGING-ADHERENCE');
    });

    it('returns null when user has logged recently (< 3 days)', () => {
      expect(rule10_mealLoggingAdherence(1)).toBeNull();
    });
  });

  // Comprehensive orchestrator test
  describe('evaluateCdsRules Engine Orchestrator', () => {
    it('evaluates full patient clinical profile and returns all applicable alerts', () => {
      const alerts = evaluateCdsRules({
        bmi: 31.0,
        bmr: 1600,
        medicalConditions: ['DIABETES', 'HYPERTENSION'],
        allergies: ['shellfish'],
        currentWeightKg: 90,
        weight30DaysAgoKg: 90,
        daysSinceLastMealLog: 0,
        latestDailyIntake: {
          calories: 2200,
          protein: 45, // below 56g RDA -> Rule 3
          carbsPct: 68, // >65% diabetic -> Rule 4
          fiber: 15, // below 38g -> Rule 6
          sodium: 2800, // >2000mg HTN -> Rule 1
          potassium: 2200,
          allergens: ['shellfish'] // Rule 8 CRITICAL
        },
        proteinRdaGrams: 56,
        fiberRdaGrams: 38
      });

      const ruleIds = alerts.map((a) => a.ruleId);
      expect(ruleIds).toContain('CDS-RULE-7-BMI-REFERRAL');
      expect(ruleIds).toContain('CDS-RULE-1-SODIUM');
      expect(ruleIds).toContain('CDS-RULE-3-PROTEIN-DEFICIT');
      expect(ruleIds).toContain('CDS-RULE-4-DIABETIC-CARB-HIGH');
      expect(ruleIds).toContain('CDS-RULE-6-FIBER-LOW');
      expect(ruleIds).toContain('CDS-RULE-8-ALLERGEN-DETECTED');
    });
  });
});
