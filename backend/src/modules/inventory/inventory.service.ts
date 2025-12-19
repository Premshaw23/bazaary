import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  InventoryTransaction,
  InventoryTransactionType,
} from '../../database/entities/inventory-transaction.entity';
import { SellerListing } from '../../database/entities/seller-listing.entity';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { OrderItem } from '../../database/entities/order-item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private inventoryTransactionsRepository: Repository<InventoryTransaction>,
    @InjectRepository(SellerListing)
    private listingsRepository: Repository<SellerListing>,
    private dataSource: DataSource,
  ) {}

  async reserve(
  reserveDto: ReserveStockDto,
  userId?: string,
  transactionManager?: any,
): Promise<InventoryTransaction> {
  // If transaction manager is provided, use it (nested in order transaction)
  if (transactionManager) {
    return await this.reserveWithManager(transactionManager, reserveDto, userId);
  }

  // Otherwise, create own transaction (standalone call)
  return await this.dataSource.transaction(async (manager) => {
    return await this.reserveWithManager(manager, reserveDto, userId);
  });
}

private async reserveWithManager(
  manager: any,
  reserveDto: ReserveStockDto,
  userId?: string,
): Promise<InventoryTransaction> {
  const listing = await manager.findOne(SellerListing, {
    where: { id: reserveDto.listingId },
    lock: { mode: 'pessimistic_write' },
  });

  if (!listing) {
    throw new NotFoundException('Listing not found');
  }

  // Idempotency: check if reservation for this order and listing already exists
  const existingReservation = await manager.findOne('InventoryTransaction', {
    where: {
      listingId: reserveDto.listingId,
      orderId: reserveDto.orderId,
      type: 'RESERVED',
    },
  });
  if (existingReservation) {
    // Already reserved for this order and listing, do nothing
    return existingReservation;
  }

  const availableStock = listing.stockQuantity - listing.reservedQuantity;
  if (availableStock < reserveDto.quantity) {
    throw new BadRequestException(
      `Insufficient stock. Available: ${availableStock}, Requested: ${reserveDto.quantity}`,
    );
  }

  const previousReserved = listing.reservedQuantity;
  listing.reservedQuantity += reserveDto.quantity;
  await manager.save(listing);

  const transaction = manager.create('InventoryTransaction', {
    listingId: listing.id,
    type: 'RESERVED',
    quantity: reserveDto.quantity,
    orderId: reserveDto.orderId,
    previousQuantity: previousReserved,
    newQuantity: listing.reservedQuantity,
    createdBy: userId,
  });
  return await manager.save(transaction);
}
  async release(
  listingId: string,
  quantity: number,
  orderId: string,
  userId?: string,
  transactionManager?: any,
): Promise<InventoryTransaction> {
  if (transactionManager) {
    return await this.releaseWithManager(transactionManager, listingId, quantity, orderId, userId);
  }

  return await this.dataSource.transaction(async (manager) => {
    return await this.releaseWithManager(manager, listingId, quantity, orderId, userId);
  });
}

private async releaseWithManager(
  manager: any,
  listingId: string,
  quantity: number,
  orderId: string,
  userId?: string,
): Promise<InventoryTransaction> {
  const listing = await manager.findOne(SellerListing, {
    where: { id: listingId },
    lock: { mode: 'pessimistic_write' },
  });

  if (!listing) {
    throw new NotFoundException('Listing not found');
  }

  if (listing.reservedQuantity < quantity) {
    throw new BadRequestException('Cannot release more than reserved quantity');
  }

  const previousReserved = listing.reservedQuantity;
  const previousStock = listing.stockQuantity;
  listing.reservedQuantity -= quantity;
  listing.stockQuantity += quantity;

  await manager.save(listing);

  const transaction = manager.create(InventoryTransaction, {
    listingId: listing.id,
    type: InventoryTransactionType.RELEASED,
    quantity: quantity, // positive, since stock is returned
    orderId,
    previousQuantity: previousStock,
    newQuantity: listing.stockQuantity,
    createdBy: userId,
  });

  return await manager.save(transaction);
}
 async deduct(
  listingId: string,
  quantity: number,
  orderId: string,
  userId?: string,
  transactionManager?: any,
): Promise<InventoryTransaction | null> {
  if (transactionManager) {
    return await this.deductWithManager(transactionManager, listingId, quantity, orderId, userId);
  }

  return await this.dataSource.transaction(async (manager) => {
    return await this.deductWithManager(manager, listingId, quantity, orderId, userId);
  });
}

private async deductWithManager(
  manager: any,
  listingId: string,
  quantity: number,
  orderId: string,
  userId?: string,
): Promise<InventoryTransaction | null> {
  // Idempotency: check if STOCK_OUT transaction for this order/listing already exists
  const existing = await manager.findOne(InventoryTransaction, {
    where: {
      listingId,
      orderId,
      type: InventoryTransactionType.STOCK_OUT,
    },
  });
  if (existing) {
    // Already deducted for this order/listing, NO-OP
    return null;
  }

  const listing = await manager.findOne(SellerListing, {
    where: { id: listingId },
    lock: { mode: 'pessimistic_write' },
  });

  if (!listing) {
    throw new NotFoundException('Listing not found');
  }

  if (listing.reservedQuantity < quantity) {
    throw new BadRequestException('Reserved quantity insufficient');
  }

  if (listing.stockQuantity < quantity) {
    throw new BadRequestException('Stock quantity insufficient');
  }

  const previousStock = listing.stockQuantity;
  listing.stockQuantity -= quantity;
  listing.reservedQuantity -= quantity;


  await manager.save(listing);
  // Debug log: print new stock and reserved quantities
  // eslint-disable-next-line no-console
  console.log(`[InventoryService] Listing ${listing.id} after deduction: stockQuantity=${listing.stockQuantity}, reservedQuantity=${listing.reservedQuantity}`);

  const transaction = manager.create(InventoryTransaction, {
    listingId: listing.id,
    type: InventoryTransactionType.STOCK_OUT,
    quantity: -quantity,
    orderId,
    previousQuantity: previousStock,
    newQuantity: listing.stockQuantity,
    createdBy: userId,
  });

  return await manager.save(transaction);
}
  async adjust(
    listingId: string,
    adjustDto: AdjustStockDto,
    userId?: string,
  ): Promise<InventoryTransaction> {
    return await this.dataSource.transaction(async (manager) => {
      const listing = await manager.findOne(SellerListing, {
        where: { id: listingId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!listing) {
        throw new NotFoundException('Listing not found');
      }

      const previousStock = listing.stockQuantity;

      if (adjustDto.type === InventoryTransactionType.STOCK_IN) {
        listing.stockQuantity += Math.abs(adjustDto.quantity);
      } else {
        const deduction = Math.abs(adjustDto.quantity);
        if (listing.stockQuantity < deduction) {
          throw new BadRequestException('Insufficient stock for deduction');
        }
        listing.stockQuantity -= deduction;
      }

      await manager.save(listing);

      const transaction = manager.create(InventoryTransaction, {
        listingId: listing.id,
        type: adjustDto.type,
        quantity: adjustDto.quantity,
        referenceId: adjustDto.referenceId,
        reason: adjustDto.reason,
        previousQuantity: previousStock,
        newQuantity: listing.stockQuantity,
        createdBy: userId,
      });

      return await manager.save(transaction);
    });
  }
  async getTransactions(listingId: string): Promise<InventoryTransaction[]> {
    return await this.inventoryTransactionsRepository.find({
      where: { listingId },
      order: { createdAt: 'DESC' },
    });
  }
  async getAvailableStock(listingId: string): Promise<number> {
    const listing = await this.listingsRepository.findOne({
      where: { id: listingId },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing.stockQuantity - listing.reservedQuantity;
  }

  async getReservedItemsByOrder(orderId: string, manager: any) {
    // Returns [{ listingId, quantity }]
    return await manager.getRepository(OrderItem)
      .createQueryBuilder('item')
      .select(['item.listing_id AS listingId', 'item.quantity AS quantity'])
      .where('item.order_id = :orderId', { orderId })
      .getRawMany();
  }
}
