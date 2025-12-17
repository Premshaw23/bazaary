import { RedisOptions } from 'ioredis';

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : (() => { throw new Error('REDIS_PORT is not defined in environment variables'); })(),
  maxRetriesPerRequest: null, // Required for BullMQ
};