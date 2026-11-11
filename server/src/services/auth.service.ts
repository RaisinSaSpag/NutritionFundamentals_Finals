import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { AuthTokenPayload, UserRole } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is required in production.');
})() : 'dev_jwt_secret_insecure_local_only');
const TOKEN_EXPIRY = '7d';

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.isActive) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole
    };

    const token = this.generateToken(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        healthProfile: user.healthProfile,
        providerProfile: user.providerProfile
      }
    };
  }

  async registerConsumer(data: any) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: 'An account with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userRepo.createConsumerUser({
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      passwordHash
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: 'CONSUMER'
    });

    return { token, user };
  }

  async registerProvider(data: any) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: 'An account with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userRepo.createProviderUser({
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      passwordHash
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: 'PROVIDER'
    });

    return { token, user };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      healthProfile: user.healthProfile,
      providerProfile: user.providerProfile
    };
  }
}

export const authService = new AuthService();
