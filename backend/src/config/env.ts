import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  demoMode: process.env.DEMO_MODE !== 'false',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'khakhi_guard_classified_jwt_secret_key_2026_mha_i4c',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  storageType: process.env.STORAGE_TYPE || 'local',
  storageLocalDir: path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR || './uploads'),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  etherscanApiKey: process.env.ETHERSCAN_API_KEY || '',
  ocrEngine: process.env.OCR_ENGINE || 'regex',
};
