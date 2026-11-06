/**
 * Recommended Dietary Allowances (RDA) & Dietary Reference Intakes (DRI)
 * Sources:
 * - National Academies of Sciences, Engineering, and Medicine (NAM / IOM) Dietary Reference Intakes
 * - Dietary Guidelines for Americans (USDA / HHS 2020-2025)
 * - WHO Guidelines on Sodium and Potassium Intake for Adults and Children
 */

export interface NutrientTarget {
  name: string;
  unit: string;
  target: number;
  isUpperLimit?: boolean;
  notes?: string;
}

export interface MicronutrientTargets {
  fiber: number; // grams
  sodiumUl: number; // mg (Upper Limit)
  potassium: number; // mg (Adequate Intake)
  calcium: number; // mg
  iron: number; // mg
  vitaminC: number; // mg
}

export interface AmdrRange {
  minPercent: number;
  maxPercent: number;
}

/**
 * Acceptable Macronutrient Distribution Ranges (AMDR)
 * Carbs: 45-65% of daily energy
 * Fat: 20-35% of daily energy
 * Protein: 10-35% of daily energy
 */
export const AMDR_RANGES: Record<'carbs' | 'fat' | 'protein', AmdrRange> = {
  carbs: { minPercent: 45, maxPercent: 65 },
  fat: { minPercent: 20, maxPercent: 35 },
  protein: { minPercent: 10, maxPercent: 35 }
};

/**
 * Baseline Protein Requirement: 0.8 g / kg body weight / day for healthy adults
 */
export const PROTEIN_RDA_PER_KG = 0.8;

/**
 * Age and Sex-Specific Daily Micronutrient Targets (Adults)
 */
export const MICRONUTRIENT_DRI_TABLE: {
  MALE: MicronutrientTargets;
  FEMALE: MicronutrientTargets;
} = {
  MALE: {
    fiber: 38, // g/day (IOM DRI for adult males 19-50)
    sodiumUl: 2300, // mg/day (Chronic Disease Risk Reduction / Upper Limit)
    potassium: 3400, // mg/day (Adequate Intake for adult males)
    calcium: 1000, // mg/day (RDA 19-70 yrs)
    iron: 8, // mg/day (RDA adult males)
    vitaminC: 90 // mg/day (RDA adult males)
  },
  FEMALE: {
    fiber: 25, // g/day (IOM DRI for adult females 19-50)
    sodiumUl: 2300, // mg/day (Upper Limit)
    potassium: 2600, // mg/day (Adequate Intake for adult females)
    calcium: 1000, // mg/day (RDA 19-50 yrs; increases to 1200 at 51+)
    iron: 18, // mg/day (RDA premenopausal females; 8 mg for postmenopausal)
    vitaminC: 75 // mg/day (RDA adult females)
  }
};
