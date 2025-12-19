import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEntity } from '../../../database/entities/event.entity';
import { InventoryService } from '../../inventory/inventory.service';

@Injectable()
export class OrderPaidHandler {
  private readonly logger = new Logger(OrderPaidHandler.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
  ) {}

  async handle(event: EventEntity): Promise<void> {
    const { orderId, userId } = event.payload;

    this.logger.log(`Handling ORDER_PAID for order ${orderId}`);


    await this.dataSource.transaction(async (manager) => {
      const reservedItems = await this.inventoryService.getReservedItemsByOrder(orderId, manager);
      this.logger.debug(`Reserved items for order ${orderId}: ${JSON.stringify(reservedItems)}`);
      for (const item of reservedItems) {
        this.logger.log(
          `Deducting ${item.quantity} units for listing ${item.listingid}`,
        );
        await this.inventoryService.deduct(
          item.listingid,
          item.quantity,
          orderId,
          userId,
          manager,
        );
      }
    });

    this.logger.log(`Inventory deducted for order ${orderId}`);
  }
}
