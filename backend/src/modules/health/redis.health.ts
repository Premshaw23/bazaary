import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private redis: Redis;

  constructor() {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379') || 6379,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.redis.status || this.redis.status === 'end') {
        await this.redis.connect();
      }
      const result = await this.redis.ping();
      if (result === 'PONG') {
        return this.getStatus(key, true, { connection: 'up', status: this.redis.status });
      }
      throw new Error('Redis ping failed');
    } catch (error) {
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { connection: 'down', error: error.message }),
      );
    }
  }
}