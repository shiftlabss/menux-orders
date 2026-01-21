import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
  CACHE_TTL_SECONDS: z.string().transform(Number).default('600'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  JWT_SECRET: z.string({ required_error: 'JWT_SECRET is required' }),
  JWT_EXPIRES_IN: z.string().default('24h'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 4));
  process.exit(1);
}

export const config = {
  env: _env.data.NODE_ENV,
  port: _env.data.PORT,
  db: {
    url: _env.data.DATABASE_URL,
  },
  redis: {
    url: _env.data.REDIS_URL,
    ttl: _env.data.CACHE_TTL_SECONDS,
  },
  rabbitmq: {
    url: _env.data.RABBITMQ_URL,
  },
  logger: {
    level: _env.data.LOG_LEVEL,
  },
  jwt: {
    secret: _env.data.JWT_SECRET,
    expiresIn: _env.data.JWT_EXPIRES_IN,
  },
};
