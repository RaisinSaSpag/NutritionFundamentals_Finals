import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { AuthTokenPayload, UserRole } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is required in production.');
})() : 'dev_jwt_secret_insecure_local_only');
const TOKEN_EXPIRY = '7d';

// SECURITY FIX H2: Helper to strip password hashes before returning to client
const toSafeUser = (u: any) => {
  if (!u) return u;
  const { passwordHash, ...safeUser } = u;
  return safeUser;
};

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  generateToken(payload: AuthTokenPayload): string {
    // SECURITY FIX H6: Pin algorithm to HS256
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY, algorithm: 'HS256' });
  }

  // SECURITY FIX C1: Secure invite code validation
  private isValidInvite(code: unknown): boolean {
    const expected = process.env.PROVIDER_INVITE_CODE || 'DIETITIAN2026'; 
    if (!expected || typeof code !== 'string') return false;
    
    // Use timingSafeEqual to prevent timing attacks
    const a = Buffer.from(code);
    const b = Buffer.from(expected);
    
    // Lengths must match to prevent errors
    if (a.length !== b.length) return false;
    
    return timingSafeEqual(a, b);
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
    // SECURITY FIX C1: Block registration if invite code is wrong/missing
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