import { PrismaClient } from '@prisma/client';
import { logger } from '../logger/index.js';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// @ts-ignore
prisma.$on('error', (e: any) => {
  logger.error('Prisma Database Error', { error: e.message });
});
