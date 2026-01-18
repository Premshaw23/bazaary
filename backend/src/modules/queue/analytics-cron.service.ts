import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SellersService } from '../sellers/sellers.service';
import { SellerLifecycle } from '../../database/entities/seller.entity';

@Injectable()
export class AnalyticsCronService {
  private readonly logger = new Logger(AnalyticsCronService.name);

  constructor(
    @InjectQueue('analytics') private analyticsQueue: Queue,
    private readonly sellersService: SellersService,
  ) {}

  // Run every night at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dispatchAnalyticsJobs() {
    this.logger.log('Starting daily seller analytics aggregation...');
    
    // In a real app, use pagination. For now, fetch all active sellers (limit 1000)
    const sellers = await this.sellersService.findAll({ lifecycleState: SellerLifecycle.ACTIVE });
    
    for (const seller of sellers) {
      await this.analyticsQueue.add('aggregate-seller-stats', { sellerId: seller.id });
    }

    this.logger.log(`Dispatched analytics jobs for ${sellers.length} sellers.`);
  }
}
