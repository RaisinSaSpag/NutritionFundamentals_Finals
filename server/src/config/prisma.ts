import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Ensure absolute sqlite path if using local dev.db
const databaseUrl = process.env.DATABASE_URL || `file:${path.resolve(__dirname, '../../../database/prisma/dev.db')}`;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

export default prisma;
