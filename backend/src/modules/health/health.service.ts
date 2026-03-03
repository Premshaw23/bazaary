import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { InjectConnection as InjectMongoConnection } from '@nestjs/mongoose';
import { Connection } from 'typeorm';
import { Connection as MongoConnection } from 'mongoose';
import Redis from 'ioredis';
import { MeiliSearch } from 'meilisearch';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: {
    [service: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
      metadata?: any;
    };
  };
  timestamp: string;
  uptime: number;
  version: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redis: Redis;
  private meiliClient: MeiliSearch;

  constructor(
    @InjectConnection()
    private readonly postgresConnection: Connection,
    @InjectMongoConnection()
    private readonly mongoConnection: MongoConnection,
  ) {
    // Initialize Redis connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379') || 6379,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    
    this.meiliClient = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    });
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks: HealthCheckResult['checks'] = {};

    // Run all health checks in parallel with timeout
    const [postgresHealth, mongoHealth, redisHealth, meiliHealth] = await Promise.allSettled([
      this.checkPostgres(),
      this.checkMongoDB(),
      this.checkRedis(),
      this.checkMeiliSearch(),
    ]);

    // Process results
    checks.postgres = this.processHealthCheck(postgresHealth);
    checks.mongodb = this.processHealthCheck(mongoHealth);
    checks.redis = this.processHealthCheck(redisHealth);
    checks.meilisearch = this.processHealthCheck(meiliHealth);

    // Determine overall status
    const allHealthy = Object.values(checks).every(check => check.status === 'up');
    
    const result: HealthCheckResult = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    const totalTime = Date.now() - startTime;
    this.logger.log(`Health check completed in ${totalTime}ms - Status: ${result.status}`);
    
    return result;
  }

  private async checkPostgres(): Promise<{ responseTime: number }> {
    const start = Date.now();
    await this.postgresConnection.query('SELECT 1');
    return { responseTime: Date.now() - start };
  }

  private async checkMongoDB(): Promise<{ responseTime: number; metadata: any }> {
    const start = Date.now();
    if (!this.mongoConnection.db) {
      throw new Error('MongoDB connection not available');
    }
    const adminDb = this.mongoConnection.db.admin();
    const result = await adminDb.ping();
    return { 
      responseTime: Date.now() - start,
      metadata: { 
        readyState: this.mongoConnection.readyState,
        ping: result 
      }
    };
  }

  private async checkRedis(): Promise<{ responseTime: number; metadata: any }> {
    const start = Date.now();
    if (!this.redis.status || this.redis.status === 'end') {
      await this.redis.connect();
    }
    const pong = await this.redis.ping();
    const info = await this.redis.info('server');
    
    return {
      responseTime: Date.now() - start,
      metadata: {
        status: this.redis.status,
        ping: pong,
        version: this.extractRedisVersion(info)
      }
    };
  }

  private async checkMeiliSearch(): Promise<{ responseTime: number; metadata: any }> {
    const start = Date.now();
    const health = await this.meiliClient.health();
    const version = await this.meiliClient.getVersion();
    
    return {
      responseTime: Date.now() - start,
      metadata: {
        health,
        version: version.pkgVersion
      }
    };
  }

  private processHealthCheck(settledResult: PromiseSettledResult<any>) {
    if (settledResult.status === 'fulfilled') {
      return {
        status: 'up' as const,
        ...settledResult.value
      };
    } else {
      this.logger.error('Health check failed:', settledResult.reason);
      return {
        status: 'down' as const,
        error: settledResult.reason?.message || 'Unknown error'
      };
    }
  }

  private extractRedisVersion(info: string): string {
    const match = info.match(/redis_version:(\d+\.\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  }

  async checkReadiness(): Promise<{ ready: boolean; services: string[] }> {
    const health = await this.checkHealth();
    const readyServices = Object.entries(health.checks)
      .filter(([_, check]) => check.status === 'up')
      .map(([service]) => service);
    
    // Core services required for readiness
    const coreServices = ['postgres', 'mongodb', 'redis'];
    const ready = coreServices.every(service => readyServices.includes(service));
    
    return { ready, services: readyServices };
  }

  async checkLiveness(): Promise<{ alive: boolean; uptime: number }> {
    return {
      alive: true,
      uptime: process.uptime()
    };
  }
}