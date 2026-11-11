import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { JWT_SECRET } from '../config/env';
import { AuthTokenPayload, UserRole } from '../types/auth.types';

const TOKEN_EXPIRY = '7d';
// SECURITY FIX 4b: Dummy hash to prevent timing attacks on unknown emails
const DUMMY_HASH = '$2a$10$X8/5wT4rF6u7vY8z9A0b1uC2d3E4f5G6h7I8j9K0l1M2n3O4p5Q6r';

const toSafeUser = (u: any) => {
  if (!u) return u;
  const { passwordHash, ...safeUser } = u;
  return safeUser;
};

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY, algorithm: 'HS256' });
  }

  private isValidInvite(code: unknown): boolean {
    const expected = process.env.PROVIDER_INVITE_CODE;
    if (!expected || typeof code !== 'string') return false;
    const a = Buffer.from(code);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  async login(email: string, passwordPlain: string) {
    const user = await this.userRepo.findByEmail(email);
    
    if (!user) {
      // SECURITY FIX 4b: Run dummy compare to equalize timing
      await bcrypt.compare(passwordPlain, DUMMY_HASH);
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    if (!user.isActive) {
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
      user: toSafeUser(user)
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

    return { token, user: toSafeUser(user) };
  }

  async registerProvider(data: any) {
    if (!this.isValidInvite(data.inviteCode)) {
      throw { statusCode: 403, message: 'Provider registration is by invitation only. Invalid invite code.' };
    }

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

    return { token, user: toSafeUser(user) };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    return toSafeUser(user);
  }
}

export const authService = new AuthService();