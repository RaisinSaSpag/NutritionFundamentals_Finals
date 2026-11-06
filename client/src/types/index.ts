export type UserRole = 'CONSUMER' | 'PROVIDER';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;
}

export interface HealthProfile {
  id: string;
  sex: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm: number;
  weightKg: number;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  allergies: string[];
  medicalConditions: string[];
  nutritionGoals: string;
  useAsianPacificBmi: boolean;
}

export interface ComputedMetrics {
  age: number;
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  isAsianPacific: boolean;
  bmr: number;
  tee: number;
  activityMultiplier: number;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
  healthProfile?: HealthProfile;
  providerProfile?: {
    licenseNumber: string;
    credentials: string;
    bio: string;
    specialties: string[];
  };
  computedMetrics?: ComputedMetrics;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  potassium: number;
  allergenTags: string;
}

export interface MealLogItem {
  id: string;
  foodItemId: string;
  servings: number;
  foodItem: FoodItem;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  notes?: string;
  items: MealLogItem[];
}

export interface CdsAlert {
  ruleId: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL' | 'FLAG';
  message: string;
}

export interface DailyNutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  potassium: number;
}

export interface RdaTargets {
  proteinGrams: number;
  fiberGrams: number;
  sodiumMaxMg: number;
  potassiumMg: number;
  calciumMg: number;
  ironMg: number;
  vitaminCMg: number;
}

export interface NutritionAnalytics {
  date: string;
  profile: {
    age: number;
    sex: string;
    heightCm: number;
    weightKg: number;
    bmi: number;
    bmiCategory: string;
    bmr: number;
    tee: number;
  };
  todayTotals: DailyNutritionTotals;
  targets: RdaTargets;
  macroPercentages: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  sevenDayTrend: Array<{
    date: string;
    calories: number;
    targetCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  activeAlerts: CdsAlert[];
}

export interface Appointment {
  id: string;
  consumerId: string;
  providerId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  roomName: string;
  notes?: string;
  consumer?: {
    id: string;
    email: string;
    profile?: UserProfile;
    healthProfile?: HealthProfile;
  };
  provider?: {
    id: string;
    email: string;
    profile?: UserProfile;
    providerProfile?: any;
  };
  charts?: AdimeChart[];
}

export interface AdimeChart {
  id: string;
  appointmentId?: string;
  consumerId: string;
  providerId: string;
  status: 'DRAFT' | 'FINALIZED';
  assessmentFoodNutritionHistory: string;
  assessmentAnthropometrics: string;
  assessmentBiochemical: string;
  assessmentPhysicalFindings: string;
  assessmentClientHistory: string;
  diagnosisDomain: 'INTAKE' | 'CLINICAL' | 'BEHAVIORAL_ENVIRONMENTAL';
  diagnosisTerm: string;
  diagnosisEtiology: string;
  diagnosisSignsSymptoms: string;
  pesStatement: string;
  interventionFoodDelivery: string;
  interventionEducation: string;
  interventionCounseling: string;
  interventionCoordination: string;
  meIndicators: string;
  meTargets: string;
  meFollowUpDate?: string;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}
