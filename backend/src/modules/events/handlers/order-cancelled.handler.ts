import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EventEntity } from '../../../database/entities/event.entity';
import { InventoryService } from '../../inventory/inventory.service';

@Injectable()
export class OrderCancelledHandler {
  private readonly logger = new Logger(OrderCancelledHandler.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
  ) {}

  async handle(event: EventEntity): Promise<void> {
    const { orderId, userId } = event.payload;

    this.logger.log(`Handling ORDER_CANCELLED for order ${orderId}`);

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const orderItems = await this.inventoryService.getReservedItemsByOrder(orderId, manager);

      for (const item of orderItems) {
        this.logger.log(`Releasing ${item.quantity} units for listing ${item.listingId}`);
        await this.inventoryService.release(
          item.listingId,
          item.quantity,
          orderId,
          userId,
          manager,
        );
      }
    });

    this.logger.log(`Inventory released for order ${orderId}`);
  }
}
