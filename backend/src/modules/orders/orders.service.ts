import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderState } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStateDto } from './dto/update-order-state.dto';
import { OrderStateMachineService } from './order-state-machine.service';
import { EventBusService } from '../events/services/event-bus.service';
import { EventType, AggregateType } from '../events/enums/event.enums';
import { ListingsService } from '../listings/listings.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private dataSource: DataSource,
    private stateMachine: OrderStateMachineService,
    private readonly eventBus: EventBusService,
    private readonly listingsService: ListingsService,
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
  ) {}

async create(buyerId: string, createOrderDto: CreateOrderDto): Promise<Order> {
  this.logger.log('Starting order creation...');
  
  return await this.dataSource.transaction(async (manager) => {
    this.logger.log('Inside transaction...');
    
    // 1. Generate order number
    const orderNumber = await this.generateOrderNumber();
    this.logger.log(`Generated order number: ${orderNumber}`);


    // 2. Validate and fetch listings (derive snapshot from DB, not DTO)
    this.logger.log('Fetching listings and products for snapshot...');
    const listingsData = await Promise.all(
      createOrderDto.items.map(async (item) => {
        // Only fetch, do not call inventory
        const listing = await this.listingsService.findOne(item.listingId);
        const product = await this.productsService.findOne(listing.productId);
        return {
          listing,
          product,
          quantity: item.quantity,
        };
      })
    );
    this.logger.log('Listings and products fetched.');

    // 3. Verify all items are from same seller
    const sellerIds = [...new Set(listingsData.map((d) => d.listing.sellerId))];
    if (sellerIds.length > 1) {
      throw new BadRequestException('All items must be from the same seller');
    }
    const sellerId = sellerIds[0];
    this.logger.log(`Seller ID: ${sellerId}`);

    // 4. Calculate amounts and build order item snapshots
    let subtotal = 0;
    const items = listingsData.map(({ listing, product, quantity }) => {
      const itemTotal = Number(listing.price) * quantity;
      subtotal += itemTotal;
      return {
        listingId: listing.id,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity,
        unitPrice: Number(listing.price),
        totalPrice: itemTotal,
      };
    });

    const taxAmount = subtotal * 0.18;
    const shippingCharge = 0;
    const discountAmount = 0;
    const totalAmount = subtotal + taxAmount + shippingCharge - discountAmount;

    this.logger.log(`Total amount: ${totalAmount}`);

    // 5. Create order
    this.logger.log('Creating order...');
    const order = manager.create(Order, {
      orderNumber,
      buyerId,
      sellerId,
      state: OrderState.CREATED,
      subtotal,
      taxAmount,
      shippingCharge,
      discountAmount,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress || createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
    });

    const savedOrder = await manager.save(Order, order);
    this.logger.log(`Order saved: ${savedOrder.id}`);

    // Reserve inventory for each item (after order is saved)
    this.logger.log('Reserving inventory for order items...');
    for (const { listing, quantity } of listingsData) {
      await this.inventoryService.reserve(
        { listingId: listing.id, quantity, orderId: savedOrder.id },
        buyerId,
        manager
      );
    }

    // 7. Create order items
    this.logger.log('Creating order items...');
    const orderItems = items.map((item) =>
      manager.create(OrderItem, {
        orderId: savedOrder.id,
        ...item,
      }),
    );

    await manager.save(OrderItem, orderItems);
    this.logger.log('Order items saved');

    // 8. Publish order created event
    await this.eventBus.publish(
      EventType.ORDER_CREATED,
      AggregateType.ORDER,
      savedOrder.id,
      {
        orderId: savedOrder.id,
        buyerId,
        sellerId,
        items: createOrderDto.items,
        totalAmount,
      },
    );

    this.logger.log(`Order created successfully: ${orderNumber}`);

    return savedOrder;
  });
}

  async findAll(filters?: {
    buyerId?: string;
    sellerId?: string;
    state?: OrderState;
  }): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller');

    if (filters?.buyerId) {
      query.andWhere('order.buyer_id = :buyerId', { buyerId: filters.buyerId });
    }

    if (filters?.sellerId) {
      query.andWhere('order.seller_id = :sellerId', {
        sellerId: filters.sellerId,
      });
    }

    if (filters?.state) {
      query.andWhere('order.state = :state', { state: filters.state });
    }

    query.orderBy('order.created_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<any> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['buyer', 'seller'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Fetch latest payment for this order (by createdAt DESC)
    const payment = await this.dataSource.getRepository('Payment').findOne({
      where: { orderId: id },
      order: { createdAt: 'DESC' },
    });
    if (payment) {
      (order as any).payment = {
        id: payment.id,
        gatewayTransactionId: payment.gatewayTransactionId,
        status: payment.status,
      };
    }

    return order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await this.orderItemsRepository.find({
      where: { orderId },
      relations: ['listing', 'product'],
    });
  }

  async updateState(
    orderId: string,
    updateDto: UpdateOrderStateDto,
    userId: string,
  ): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Validate state transition
      this.stateMachine.validateTransition(order.state, updateDto.state);

      // Update order
      order.previousState = order.state;
      order.state = updateDto.state;
      order.stateChangedAt = new Date();

      if (updateDto.trackingNumber) {
        order.trackingNumber = updateDto.trackingNumber;
      }

      if (updateDto.carrier) {
        order.carrier = updateDto.carrier;
      }


      // Update timestamps based on state
      switch (updateDto.state) {
        case OrderState.PAID:
          order.paidAt = new Date();
          break;
        case OrderState.CONFIRMED:
          order.confirmedAt = new Date();
          break;
        case OrderState.SHIPPED:
          order.shippedAt = new Date();
          break;
        case OrderState.DELIVERED:
          order.deliveredAt = new Date();
          break;
        case OrderState.CANCELLED:
          order.cancelledAt = new Date();
          order.cancellationReason = String(updateDto.reason);
          // Release reserved inventory for each order item
          const orderItems = await manager.find(OrderItem, { where: { orderId } });
          for (const item of orderItems) {
            await this.inventoryService.release(
              item.listingId,
              item.quantity,
              orderId,
              userId,
              manager
            );
          }
          break;
      }

      const updatedOrder = await manager.save(Order, order);

      // Publish event for state transition

      // Ensure event type is exactly 'ORDER_CANCELLED' for handler compatibility
      const eventType = updateDto.state === 'CANCELLED' ? 'ORDER_CANCELLED' : `ORDER_${updateDto.state}`;
      await this.eventBus.publish(
        eventType,
        AggregateType.ORDER,
        order.id,
        {
          orderId: order.id,
          state: updateDto.state,
          userId,
        },
      );

      this.logger.log(
        `Order ${order.orderNumber} transitioned to ${updateDto.state}`,
      );

      return updatedOrder;
    });
  }

  async cancel(
    orderId: string,
    reason: string,
    userId: string,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (!this.stateMachine.canCancel(order.state)) {
      throw new BadRequestException(
        `Cannot cancel order in ${order.state} state`,
      );
    }

    return await this.updateState(
      orderId,
      { state: OrderState.CANCELLED, reason },
      userId,
    );
  }



  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.ordersRepository.count();
    const orderNumber = `BAZ-${year}-${String(count + 1).padStart(6, '0')}`;
    return orderNumber;
  }
}
