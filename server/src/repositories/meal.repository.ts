import prisma from '../config/prisma';

export class MealRepository {
  async getFoodItems(query?: string) {
    if (!query) {
      return prisma.foodItem.findMany({
        orderBy: { name: 'asc' },
        take: 100
      });
    }

    return prisma.foodItem.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { category: { contains: query } }
        ]
      },
      orderBy: { name: 'asc' }
    });
  }

  async getFoodItemById(id: string) {
    return prisma.foodItem.findUnique({ where: { id } });
  }

  async createFoodItem(data: {
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
    allergenTags?: string[];
  }) {
    return prisma.foodItem.create({
      data: {
        ...data,
        allergenTags: JSON.stringify(data.allergenTags || [])
      }
    });
  }

  async createMealLog(
    userId: string,
    date: string,
    mealType: string,
    items: Array<{ foodItemId: string; servings: number }>,
    notes?: string
  ) {
    return prisma.mealLog.create({
      data: {
        userId,
        date,
        mealType,
        notes,
        items: {
          create: items.map((item) => ({
            foodItemId: item.foodItemId,
            servings: item.servings
          }))
        }
      },
      include: {
        items: {
          include: {
            foodItem: true
          }
        }
      }
    });
  }

  async getMealLogsByDate(userId: string, date: string) {
    return prisma.mealLog.findMany({
      where: { userId, date },
      include: {
        items: {
          include: {
            foodItem: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getMealLogsRange(userId: string, startDate: string, endDate: string) {
    return prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            foodItem: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async deleteMealLog(id: string, userId: string) {
    return prisma.mealLog.deleteMany({
      where: { id, userId }
    });
  }
}

export const mealRepository = new MealRepository();
