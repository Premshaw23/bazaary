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

    // Edge case validation
    if (typeof PLATFORM_FEE_PERCENT !== 'number' || isNaN(PLATFORM_FEE_PERCENT) || PLATFORM_FEE_PERCENT < 0) {
      this.logger.error(`Invalid PLATFORM_FEE_PERCENT: ${PLATFORM_FEE_PERCENT}`);
      return;
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      this.logger.warn(`Order amount is invalid or non-positive for order ${orderId}: ${amount}`);
      return;
    }

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
    if (sellerId) {
      const fee = Number((amount * PLATFORM_FEE_PERCENT) / 100);
      const sellerAmount = amount - fee;
      if (fee < 0 || sellerAmount < 0) {
        this.logger.error(`Calculated negative fee or seller amount for order ${orderId}: fee=${fee}, sellerAmount=${sellerAmount}`);
        return;
      }
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
      this.logger.warn(`Wallet NOT credited: sellerId missing in event payload for order ${orderId}`);
    }
  }
}
