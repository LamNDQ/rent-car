import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../provider';
import { SetCacheDto } from '../dto';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  // redis value as json
  async set(payload: SetCacheDto): Promise<void> {
    const { key, value, ttlInSeconds } = payload;
    const stringifyValue = JSON.stringify(value);

    try {
      if (ttlInSeconds) {
        await this.redisClient.set(key, stringifyValue, 'EX', ttlInSeconds);
      } else {
        await this.redisClient.set(key, stringifyValue);
      }
    } catch (error) {
      this.logger.error(`Error when set cache key ${key}:`, error.stack);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Lỗi khi get cache key ${key}:`, error.stack);
      return null; //  null to continue for DB
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
