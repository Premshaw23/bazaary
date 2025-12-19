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

    this.logger.log(`Handling ORDER_CREATED for order ${orderId}, eventId: ${event.id}`);

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        // Log reservedQuantity before reservation
        const listingBefore = await manager.findOne('SellerListing', { where: { id: item.listingId } });
        const beforeReserved = (listingBefore as any)?.reservedQuantity;
        this.logger.log(
          `Before reserve: listingId=${item.listingId}, reservedQuantity=${beforeReserved}`
        );

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

        // Log reservedQuantity after reservation
        const listingAfter = await manager.findOne('SellerListing', { where: { id: item.listingId } });
        const afterReserved = (listingAfter as any)?.reservedQuantity;
        this.logger.log(
          `After reserve: listingId=${item.listingId}, reservedQuantity=${afterReserved}`
        );
      }
    });

    this.logger.log(`Inventory reserved for order ${orderId}, eventId: ${event.id}`);
  }
}
