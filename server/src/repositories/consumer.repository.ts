import prisma from '../config/prisma';

export class ConsumerRepository {
  async getConsumerProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        healthProfile: true,
        weightHistory: {
          orderBy: { recordedAt: 'asc' }
        }
      }
    });
  }

  async updateHealthProfile(
    userId: string,
    data: {
      heightCm?: number;
      weightKg?: number;
      activityLevel?: string;
      allergies?: string[];
      medicalConditions?: string[];
      nutritionGoals?: string;
      useAsianPacificBmi?: boolean;
    }
  ) {
    const updateData: any = {};
    if (data.heightCm !== undefined) updateData.heightCm = data.heightCm;
    if (data.weightKg !== undefined) updateData.weightKg = data.weightKg;
    if (data.activityLevel !== undefined) updateData.activityLevel = data.activityLevel;
    if (data.allergies !== undefined) updateData.allergies = JSON.stringify(data.allergies);
    if (data.medicalConditions !== undefined) updateData.medicalConditions = JSON.stringify(data.medicalConditions);
    if (data.nutritionGoals !== undefined) updateData.nutritionGoals = data.nutritionGoals;
    if (data.useAsianPacificBmi !== undefined) updateData.useAsianPacificBmi = data.useAsianPacificBmi;

    return prisma.healthProfile.update({
      where: { userId },
      data: updateData
    });
  }

  async recordWeight(userId: string, weightKg: number) {
    return prisma.weightHistory.create({
      data: {
        userId,
        weightKg,
        recordedAt: new Date()
      }
    });
  }

  async getWeightHistory(userId: string) {
    return prisma.weightHistory.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' }
    });
  }
}

export const consumerRepository = new ConsumerRepository();
