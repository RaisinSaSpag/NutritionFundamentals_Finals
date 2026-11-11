import 'dotenv/config';

const isLocal = ['development', 'test'].includes(process.env.NODE_ENV ?? '');
const secret = process.env.JWT_SECRET;

if (!isLocal && (!secret || secret.length < 32)) {
  throw new Error('FATAL: JWT_SECRET (>=32 chars) is required unless NODE_ENV is development or test.');
}

export const JWT_SECRET = secret ?? 'dev_jwt_secret_insecure_local_only';