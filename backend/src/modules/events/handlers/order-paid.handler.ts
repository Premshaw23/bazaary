import { Injectable, Logger } from '@nestjs/common';
import { PLATFORM_FEE_PERCENT } from '../../../config/platform.config';
import { LedgerReason } from '../../wallets/entities/wallet-ledger.entity';
import { DataSource } from 'typeorm';
import { EventEntity } from '../../../database/entities/event.entity';
import { InventoryService } from '../../inventory/inventory.service';
import { WalletsService } from '../../wallets/wallets.service';

@Injectable()
export class OrderPaidHandler {
  private readonly logger = new Logger(OrderPaidHandler.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
  ) {}

  async handle(event: EventEntity): Promise<void> {
    const { orderId, userId, sellerId, amount } = event.payload;

    // this.logger.log(`[OrderPaidHandler] Handling ORDER_PAID for order ${orderId}, sellerId: ${sellerId}, amount: ${amount}, userId: ${userId}`);
    // this.logger.debug(`[OrderPaidHandler] Full event payload: ${JSON.stringify(event.payload)}`);

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

    // Split amount for platform fee and seller net
    if (sellerId && amount) {
      const fee = Number((amount * PLATFORM_FEE_PERCENT) / 100);
      const sellerAmount = amount - fee;

      // Seller gets net amount
      await this.walletsService.creditLocked(
        sellerId,
        orderId,
        sellerAmount,
        LedgerReason.ORDER_PAID,
      );
      this.logger.log(`Wallet credited (LOCKED) for seller ${sellerId}, order ${orderId}, amount ${sellerAmount}`);

      // Platform fee (tracked separately)
      await this.walletsService.creditPlatformFee(
        fee,
        orderId,
      );
      this.logger.log(`Platform fee credited for order ${orderId}, amount ${fee}`);
    } else {
      this.logger.warn(`Wallet NOT credited: sellerId or amount missing in event payload for order ${orderId}`);
    }
  }
}
