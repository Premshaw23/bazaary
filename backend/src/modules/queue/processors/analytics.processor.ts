import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrderAnalyticsService } from '../../orders/order-analytics.service';
import { SellersService } from '../../sellers/sellers.service';

@Processor('analytics')
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    private readonly analyticsService: OrderAnalyticsService,
    private readonly sellersService: SellersService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'aggregate-seller-stats') {
      const { sellerId } = job.data;
      this.logger.log(`Processing analytics for seller ${sellerId}`);
      
      try {
        const metrics = await this.analyticsService.getSellerStats(sellerId);
        await this.sellersService.updateMetrics(sellerId, metrics);
        this.logger.log(`Updated metrics for seller ${sellerId}: ${JSON.stringify(metrics)}`);
      } catch (e) {
        this.logger.error(`Failed to update metrics for seller ${sellerId}: ${e.message}`);
        throw e;
      }
    }
  }
}
