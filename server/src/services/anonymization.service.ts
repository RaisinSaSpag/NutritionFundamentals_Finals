import prisma from '../config/prisma';

export function getAge5YearBand(age: number): string {
  if (age < 0) return 'Unknown';
  const lower = Math.floor(age / 5) * 5;
  const upper = lower + 4;
  return `${lower}-${upper}`;
}

export interface DeidentifiedDemographics {
  sex: string;
  ageBand: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
}

export interface AnonymizedMealSummary {
  studyDay: string;
  mealType: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalSodiumMg: number;
  totalPotassiumMg: number;
}

export interface AnonymizedCarePlan {
  diagnosisDomain: string | null;
  diagnosisTerm: string | null;
  interventionCategory: string;
  monitoringIndicators: string | null;
}

export interface DeidentifiedSubject {
  researchSubjectId: string;
  demographics: DeidentifiedDemographics;
  clinicalConditions: string[];
  allergies: string[];
  loggedMealsSummary: AnonymizedMealSummary[];
  finalizedCarePlans: AnonymizedCarePlan[];
}

export interface DeidentifiedResearchDataset {
  metadata: {
    exportedAt: string;
    totalSubjects: number;
    anonymizationStandard: string;
    phiStripped: string[];
  };
  subjects: DeidentifiedSubject[];
}

export class AnonymizationService {
  async getDeidentifiedResearchDataset(): Promise<DeidentifiedResearchDataset> {
    const consumers = await prisma.user.findMany({
      where: { role: 'CONSUMER' },
      include: {
        profile: true,
        healthProfile: true,
        mealLogs: {
          include: {
            items: {
              include: {
                foodItem: true
              }
            }
          },
          orderBy: { date: 'asc' }
        },
        consumerCharts: {
          where: { status: 'FINALIZED' }
        }
      }
    });

    const dataset: DeidentifiedSubject[] = consumers.map((c, index) => {
      // Pseudonymization: synthetic research study ID
      const researchSubjectId = `SUBJ-${(index + 1).toString().padStart(4, '0')}`;

      // Calculate age and assign 5-year age band
      let ageBand = 'Unknown';
      if (c.profile?.dateOfBirth) {
        const dob = new Date(c.profile.dateOfBirth);
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
        ageBand = getAge5YearBand(age);
      }

      const hp = c.healthProfile;

      // Date generalized relative day sequence
      const earliestMeal = c.mealLogs[0]?.date ? new Date(c.mealLogs[0].date).getTime() : Date.now();

      const anonymizedMeals: AnonymizedMealSummary[] = c.mealLogs.map((m) => {
        const mealTime = new Date(m.date).getTime();
        const studyDay = Math.max(1, Math.round((mealTime - earliestMeal) / 86400000) + 1);

        const totals = m.items.reduce(
          (acc, item) => {
            const s = item.servings;
            const f = item.foodItem;
            acc.calories += f.calories * s;
            acc.protein += f.protein * s;
            acc.carbs += f.carbs * s;
            acc.fat += f.fat * s;
            acc.sodium += f.sodium * s;
            acc.potassium += f.potassium * s;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, potassium: 0 }
        );

        return {
          studyDay: `Day ${studyDay}`,
          mealType: m.mealType,
          totalCalories: Math.round(totals.calories),
          totalProteinG: Math.round(totals.protein * 10) / 10,
          totalCarbsG: Math.round(totals.carbs * 10) / 10,
          totalFatG: Math.round(totals.fat * 10) / 10,
          totalSodiumMg: Math.round(totals.sodium),
          totalPotassiumMg: Math.round(totals.potassium)
        };
      });

      // Clinical charts (de-identified diagnosis & intervention categories)
      const anonymizedCarePlans: AnonymizedCarePlan[] = c.consumerCharts.map((ch) => ({
        diagnosisDomain: ch.diagnosisDomain,
        diagnosisTerm: ch.diagnosisTerm,
        interventionCategory: ch.interventionFoodDelivery ? 'Food and/or Nutrient Delivery' : 'Nutrition Education',
        monitoringIndicators: ch.meIndicators
      }));

      let conditions: string[] = [];
      let allergyList: string[] = [];

      try {
        if (hp?.medicalConditions) {
          conditions = JSON.parse(hp.medicalConditions) as string[];
        }
      } catch {
        conditions = [];
      }

      try {
        if (hp?.allergies) {
          allergyList = JSON.parse(hp.allergies) as string[];
        }
      } catch {
        allergyList = [];
      }

      return {
        researchSubjectId,
        demographics: {
          sex: hp?.sex || 'UNKNOWN',
          ageBand,
          heightCm: hp?.heightCm || 0,
          weightKg: hp?.weightKg || 0,
          activityLevel: hp?.activityLevel || 'UNKNOWN'
        },
        clinicalConditions: conditions,
        allergies: allergyList,
        loggedMealsSummary: anonymizedMeals,
        finalizedCarePlans: anonymizedCarePlans
      };
    });

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalSubjects: dataset.length,
        anonymizationStandard: 'HIPAA Safe Harbor / 5-Year Age Grouping / Date-Shifted Days',
        phiStripped: ['firstName', 'lastName', 'phone', 'email', 'exactBirthdate', 'exactAddress']
      },
      subjects: dataset
    };
  }
}

export const anonymizationService = new AnonymizationService();
