import { Request } from 'express';

export type UserRole = 'CONSUMER' | 'PROVIDER';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}
