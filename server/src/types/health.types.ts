export type Sex = 'MALE' | 'FEMALE' | 'OTHER';

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHT'
  | 'MODERATE'
  | 'ACTIVE'
  | 'VERY_ACTIVE';

export type MedicalCondition = 'DIABETES' | 'HYPERTENSION' | 'CKD' | string;

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  isAsianPacific: boolean;
}

export interface BmrResult {
  bmr: number;
  formula: 'Mifflin-St Jeor';
}

export interface EnergyNeedsResult {
  bmr: number;
  tee: number;
  activityLevel: ActivityLevel;
  activityMultiplier: number;
}
