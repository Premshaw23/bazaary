import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { MailProcessor } from './processors/mail.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { AnalyticsCronService } from './analytics-cron.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [
    OrdersModule,
    SellersModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  providers: [QueueService, MailProcessor, AnalyticsProcessor, AnalyticsCronService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
