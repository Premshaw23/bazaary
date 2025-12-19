import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEntity } from '../../../database/entities/event.entity';
import { InventoryService } from '../../inventory/inventory.service';

@Injectable()
export class OrderCreatedHandler {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
  ) {}

  async handle(event: EventEntity): Promise<void> {
    const { orderId, buyerId, items } = event.payload;

    this.logger.log(`Handling ORDER_CREATED for order ${orderId}`);

    // ⚠️ IDMPOTENCY RULE
    // If this event is reprocessed, inventoryService.reserve()
    // MUST be safe (you already built it that way)

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        this.logger.log(
          `Reserving ${item.quantity} units for listing ${item.listingId}`,
        );

        await this.inventoryService.reserve(
          {
            listingId: item.listingId,
            quantity: item.quantity,
            orderId,
          },
          buyerId,
          manager,
        );
      }
    });

    this.logger.log(`Inventory reserved for order ${orderId}`);
  }
}
