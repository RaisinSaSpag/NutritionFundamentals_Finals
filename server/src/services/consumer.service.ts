import { consumerRepository, ConsumerRepository } from '../repositories/consumer.repository';
import { calculateBmi } from '../domain/bmi';
import { calculateBmr } from '../domain/bmr';
import { calculateTee } from '../domain/tee';
import { ActivityLevel, Sex } from '../types/health.types';

export class ConsumerService {
  constructor(private repo: ConsumerRepository = consumerRepository) {}

  async getProfile(userId: string) {
    const user = await this.repo.getConsumerProfile(userId);
    if (!user) {
      throw { statusCode: 404, message: 'Consumer profile not found.' };
    }

    const hp = user.healthProfile;
    let computedMetrics = null;

    if (hp && user.profile) {
      const dob = new Date(user.profile.dateOfBirth);
      const ageYears = Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
      const sex = (hp.sex as Sex) || 'MALE';

      const bmi = calculateBmi(hp.weightKg, hp.heightCm, hp.useAsianPacificBmi);
      const bmr = calculateBmr(hp.weightKg, hp.heightCm, ageYears, sex);
      const tee = calculateTee(bmr.bmr, (hp.activityLevel as ActivityLevel) || 'SEDENTARY');

      computedMetrics = {
        age: ageYears,
        bmi: bmi.bmi,
        bmiCategory: bmi.category,
        isAsianPacific: bmi.isAsianPacific,
        bmr: bmr.bmr,
        tee: tee.tee,
        activityMultiplier: tee.activityMultiplier
      };
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      healthProfile: hp ? {
        ...hp,
        allergies: JSON.parse(hp.allergies || '[]'),
        medicalConditions: JSON.parse(hp.medicalConditions || '[]')
      } : null,
      computedMetrics,
      weightHistory: user.weightHistory
    };
  }

  async updateHealth(userId: string, data: any) {
    const updated = await this.repo.updateHealthProfile(userId, data);
    if (data.weightKg) {
      await this.repo.recordWeight(userId, data.weightKg);
    }
    return updated;
  }

  async addWeightLog(userId: string, weightKg: number) {
    return this.repo.recordWeight(userId, weightKg);
  }

  async getWeightLogs(userId: string) {
    return this.repo.getWeightHistory(userId);
  }
}

export const consumerService = new ConsumerService();
