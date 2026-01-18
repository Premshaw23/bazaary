import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderState } from '../../database/entities/order.entity';

@Injectable()
export class OrderAnalyticsService {
  private readonly logger = new Logger(OrderAnalyticsService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async getSellerStats(sellerId: string) {
    const stats = await this.ordersRepository
      .createQueryBuilder('order')
      .select([
        'COUNT(order.id) as total',
        'SUM(CASE WHEN order.state = :fulfilled THEN 1 ELSE 0 END) as fulfilled',
        'AVG(EXTRACT(EPOCH FROM (order.delivered_at - order.created_at))/3600) as avg_time'
      ])
      .where('order.seller_id = :sellerId', { sellerId })
      .setParameters({ fulfilled: OrderState.DELIVERED })
      .getRawOne();
      
    // Calculate return rate separately (assuming returned orders have refunded state or just cancelled for now)
    const returns = await this.ordersRepository.count({
        where: { sellerId, state: OrderState.CANCELLED } // Simplified for now
    });

    return {
        totalOrders: Number(stats.total) || 0,
        fulfilledOrders: Number(stats.fulfilled) || 0,
        averageFulfillmentTime: parseFloat(stats.avg_time) || 0,
        returnRate: (Number(stats.total) > 0 ? (returns / Number(stats.total)) * 100 : 0)
    };
  }
}
