import prisma from '../config/prisma';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        healthProfile: true,
        providerProfile: true
      }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        healthProfile: true,
        providerProfile: true
      }
    });
  }

  async createConsumerUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth: Date;
    healthProfile: {
      sex: string;
      heightCm: number;
      weightKg: number;
      activityLevel: string;
      allergies?: string[];
      medicalConditions?: string[];
      nutritionGoals?: string;
      useAsianPacificBmi?: boolean;
    };
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: 'CONSUMER',
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth
          }
        },
        healthProfile: {
          create: {
            sex: data.healthProfile.sex,
            heightCm: data.healthProfile.heightCm,
            weightKg: data.healthProfile.weightKg,
            activityLevel: data.healthProfile.activityLevel,
            allergies: JSON.stringify(data.healthProfile.allergies || []),
            medicalConditions: JSON.stringify(data.healthProfile.medicalConditions || []),
            nutritionGoals: data.healthProfile.nutritionGoals || '',
            useAsianPacificBmi: !!data.healthProfile.useAsianPacificBmi
          }
        },
        weightHistory: {
          create: {
            weightKg: data.healthProfile.weightKg,
            recordedAt: new Date()
          }
        }
      },
      include: {
        profile: true,
        healthProfile: true
      }
    });
  }

  async createProviderUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth: Date;
    providerProfile: {
      licenseNumber: string;
      credentials: string;
      bio: string;
      specialties?: string[];
    };
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: 'PROVIDER',
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth
          }
        },
        providerProfile: {
          create: {
            licenseNumber: data.providerProfile.licenseNumber,
            credentials: data.providerProfile.credentials,
            bio: data.providerProfile.bio,
            specialties: JSON.stringify(data.providerProfile.specialties || [])
          }
        }
      },
      include: {
        profile: true,
        providerProfile: true
      }
    });
  }
}

export const userRepository = new UserRepository();
