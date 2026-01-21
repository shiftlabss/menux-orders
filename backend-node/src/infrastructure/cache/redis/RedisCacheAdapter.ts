import { ICachePort } from '@application/ports/ICachePort';
import Redis from 'ioredis';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

export class RedisCacheAdapter implements ICachePort {
  private client: Redis;

  constructor() {
    this.client = new Redis(config.redis.url, {
      lazyConnect: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      logger.error({ err }, 'Redis connection error');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error({ error, key }, 'Cache GET failed');
      return null; // Fail safe
    }
  }

  async set(key: string, value: any, ttlSeconds: number = Number(config.redis.ttl)): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error({ error, key }, 'Cache SET failed');
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Cache DEL failed');
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error({ error, key }, 'Cache INCR failed');
      throw error;
    }
  }
}
