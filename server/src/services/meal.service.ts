import { mealRepository, MealRepository } from '../repositories/meal.repository';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { calculateMacronutrientPercentages, getRdaTargets } from '../domain/rda';
import { calculateBmr } from '../domain/bmr';
import { calculateTee } from '../domain/tee';
import { calculateBmi } from '../domain/bmi';
import { evaluateCdsRules } from '../domain/cds';
import { ActivityLevel, Sex } from '../types/health.types';

export class MealService {
  constructor(
    private mealRepo: MealRepository = mealRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  async searchFoods(query?: string) {
    return this.mealRepo.getFoodItems(query);
  }

  async createCustomFood(data: any) {
    return this.mealRepo.createFoodItem(data);
  }

  async logMeal(userId: string, data: { date: string; mealType: string; items: any[]; notes?: string }) {
    return this.mealRepo.createMealLog(userId, data.date, data.mealType, data.items, data.notes);
  }

  async getDayLogs(userId: string, date: string) {
    return this.mealRepo.getMealLogsByDate(userId, date);
  }

  async deleteMeal(id: string, userId: string) {
    return this.mealRepo.deleteMealLog(id, userId);
  }

  async getNutritionAnalytics(userId: string, selectedDate?: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.healthProfile) {
      throw { statusCode: 404, message: 'User health profile not found.' };
    }

    const hp = user.healthProfile;
    const dob = user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : new Date('1990-01-01');
    const ageYears = Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
    const sex = (hp.sex as Sex) || 'MALE';

    const bmiResult = calculateBmi(hp.weightKg, hp.heightCm, hp.useAsianPacificBmi);
    const bmrResult = calculateBmr(hp.weightKg, hp.heightCm, ageYears, sex);
    const teeResult = calculateTee(bmrResult.bmr, (hp.activityLevel as ActivityLevel) || 'SEDENTARY');
    const rdaTargets = getRdaTargets(hp.weightKg, ageYears, sex);

    // Compute 7-day range ending on selectedDate (or today)
    const targetDate = selectedDate ? new Date(selectedDate) : new Date();
    const startDate = new Date(targetDate);
    startDate.setDate(targetDate.getDate() - 6);

    const startDateStr = startDate.toISOString().split('T')[0];
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const logs = await this.mealRepo.getMealLogsRange(userId, startDateStr, targetDateStr);

    // Aggregate daily totals map
    const dayTotalsMap = new Map<string, {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sodium: number;
      potassium: number;
      allergens: Set<string>;
    }>();

    for (let d = 0; d < 7; d++) {
      const cur = new Date(startDate);
      cur.setDate(startDate.getDate() + d);
      const ds = cur.toISOString().split('T')[0];
      dayTotalsMap.set(ds, {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        potassium: 0,
        allergens: new Set()
      });
    }

    for (const log of logs) {
      const dayData = dayTotalsMap.get(log.date);
      if (!dayData) continue;

      for (const item of log.items) {
        const s = item.servings;
        const f = item.foodItem;
        dayData.calories += f.calories * s;
        dayData.protein += f.protein * s;
        dayData.carbs += f.carbs * s;
        dayData.fat += f.fat * s;
        dayData.fiber += f.fiber * s;
        dayData.sodium += f.sodium * s;
        dayData.potassium += f.potassium * s;

        if (f.allergenTags) {
          try {
            const tags: string[] = JSON.parse(f.allergenTags);
            tags.forEach((t) => dayData.allergens.add(t));
          } catch (_) {}
        }
      }
    }

    // 7-day trend array for Recharts
    const trend = Array.from(dayTotalsMap.entries()).map(([date, totals]) => ({
      date,
      calories: Math.round(totals.calories),
      targetCalories: teeResult.tee,
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10
    }));

    // Selected day intake totals
    const selectedDayData = dayTotalsMap.get(targetDateStr) || {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, potassium: 0, allergens: new Set()
    };

    const macroPercentages = calculateMacronutrientPercentages(
      selectedDayData.protein,
      selectedDayData.carbs,
      selectedDayData.fat,
      selectedDayData.calories
    );

    // Run CDS evaluation for the consumer
    const allergensArray = Array.from(selectedDayData.allergens);
    const userAllergies = JSON.parse(hp.allergies || '[]');
    const userConditions = JSON.parse(hp.medicalConditions || '[]');

    const caloriesLast3Days = trend.slice(-3).map((t) => t.calories);

    const activeAlerts = evaluateCdsRules({
      bmi: bmiResult.bmi,
      bmr: bmrResult.bmr,
      useAsianPacificBmi: hp.useAsianPacificBmi,
      medicalConditions: userConditions,
      allergies: userAllergies,
      currentWeightKg: hp.weightKg,
      weight30DaysAgoKg: hp.weightKg, // default if no prior weight
      daysSinceLastMealLog: logs.length > 0 ? 0 : 3,
      latestDailyIntake: {
        calories: selectedDayData.calories,
        protein: selectedDayData.protein,
        carbsPct: macroPercentages.carbsPct,
        fiber: selectedDayData.fiber,
        sodium: selectedDayData.sodium,
        potassium: selectedDayData.potassium,
        allergens: allergensArray
      },
      caloriesLast3Days,
      proteinRdaGrams: rdaTargets.proteinGrams,
      fiberRdaGrams: rdaTargets.fiberGrams
    });

    return {
      date: targetDateStr,
      profile: {
        age: ageYears,
        sex,
        heightCm: hp.heightCm,
        weightKg: hp.weightKg,
        bmi: bmiResult.bmi,
        bmiCategory: bmiResult.category,
        bmr: bmrResult.bmr,
        tee: teeResult.tee
      },
      todayTotals: {
        calories: Math.round(selectedDayData.calories),
        protein: Math.round(selectedDayData.protein * 10) / 10,
        carbs: Math.round(selectedDayData.carbs * 10) / 10,
        fat: Math.round(selectedDayData.fat * 10) / 10,
        fiber: Math.round(selectedDayData.fiber * 10) / 10,
        sodium: Math.round(selectedDayData.sodium),
        potassium: Math.round(selectedDayData.potassium)
      },
      targets: rdaTargets,
      macroPercentages,
      sevenDayTrend: trend,
      activeAlerts
    };
  }
}

export const mealService = new MealService();
