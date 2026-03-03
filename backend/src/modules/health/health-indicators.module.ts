import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';
import { RedisHealthIndicator } from './redis.health';

@Global()
@Module({
  imports: [TerminusModule],
  providers: [DatabaseHealthIndicator, RedisHealthIndicator],
  exports: [DatabaseHealthIndicator, RedisHealthIndicator],
})
export class HealthIndicatorsModule {}