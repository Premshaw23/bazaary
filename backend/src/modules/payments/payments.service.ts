import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from '../../database/entities/payment.entity';
import { Order, OrderState } from '../../database/entities/order.entity';
import { MockPaymentGateway } from './gateways/mock.gateway';
import { OrdersService } from '../orders/orders.service';
import { EventBusService } from '../events/services/event-bus.service';
import { WalletsService } from '../wallets/wallets.service';
import { LedgerReason } from '../wallets/entities/wallet-ledger.entity';
import { PLATFORM_FEE_PERCENT } from '../../config/platform.config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private mockGateway: MockPaymentGateway,
    private ordersService: OrdersService,
    private dataSource: DataSource,
    private readonly eventBus: EventBusService, // 👈 ADD
    private readonly walletsService: WalletsService, // <-- inject WalletsService
  ) {}

  async initiatePayment(
    orderId: string,
    method: PaymentMethod,
    idempotencyKey: string,
    userId: string,
  ): Promise<Payment> {
    // Check idempotency - if payment exists, return it
    const existingPayment = await this.paymentsRepository.findOne({
      where: { idempotencyKey },
    });

    if (existingPayment) {
      this.logger.log(`Returning existing payment for idempotency key: ${idempotencyKey}`);
      return existingPayment;
    }

    // Get order
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify user owns the order
    if (order.buyerId !== userId) {
      throw new BadRequestException('Unauthorized to pay for this order');
    }

    // Check order state
    if (![OrderState.CREATED, OrderState.PAYMENT_PENDING].includes(order.state)) {
      throw new BadRequestException(`Cannot initiate payment for order in ${order.state} state`);
    }

    // Create payment record
    const payment = this.paymentsRepository.create({
      orderId,
      amount: Number(order.totalAmount),
      currency: 'INR',
      method,
      status: PaymentStatus.PENDING,
      idempotencyKey,
      paymentGateway: 'MOCK',
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Update order to PAYMENT_PENDING if it's in CREATED state
    if (order.state === OrderState.CREATED) {
      await this.ordersService.updateState(
        orderId,
        { state: OrderState.PAYMENT_PENDING },
        userId,
      );
    }

    // Initiate payment with gateway
    try {
      this.logger.log(`Initiating payment with mock gateway for order ${orderId}`);
      
      const gatewayResponse = await this.mockGateway.initiatePayment(
        orderId,
        Number(order.totalAmount),
        'INR',
        method,
      );

      savedPayment.gatewayTransactionId = gatewayResponse.transactionId;
      savedPayment.gatewayOrderId = String(gatewayResponse.gatewayOrderId);
      savedPayment.gatewayResponse = gatewayResponse.gatewayResponse;

      if (gatewayResponse.success) {
        savedPayment.status = PaymentStatus.PROCESSING;
      } else {
        savedPayment.status = PaymentStatus.FAILED;
        savedPayment.failureReason =String( gatewayResponse.message);
      }

      await this.paymentsRepository.save(savedPayment);

      this.logger.log(`Payment initiated: ${savedPayment.id}, status: ${savedPayment.status}`);

      return savedPayment;
    } catch (error) {
      this.logger.error(`Payment initiation failed: ${error.message}`);
      savedPayment.status = PaymentStatus.FAILED;
      savedPayment.failureReason = error.message;
      await this.paymentsRepository.save(savedPayment);
      throw error;
    }
  }

 async verifyPayment(
  paymentId: string,
  transactionId: string,
  userId: string,
): Promise<Payment> {
  try {
    this.logger.log(`Verifying payment ${paymentId} with transaction ${transactionId}`);
    

    return await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Fetch order separately
      const order = await manager.findOne(Order, { where: { id: payment.orderId } });
      if (!order) {
        throw new NotFoundException('Order not found for payment');
      }

      this.logger.log(`Found payment: ${payment.id}, status: ${payment.status}`);

      if (order.buyerId !== userId) {
        throw new BadRequestException('Unauthorized');
      }


      if (payment.status === PaymentStatus.SUCCESS) {
        this.logger.log(`Payment already verified: ${paymentId}`);
        return payment;
      }

      // Verify with gateway
      this.logger.log(`Calling gateway to verify: ${transactionId}`);
      const gatewayResponse = await this.mockGateway.verifyPayment(transactionId);
      this.logger.log(`Gateway response: ${JSON.stringify(gatewayResponse)}`);

      if (gatewayResponse.success) {
        payment.status = PaymentStatus.SUCCESS;
        payment.completedAt = new Date();

        await manager.save(Payment, payment);
        this.logger.log(`Payment marked as SUCCESS`);

        // Update order to PAID
        this.logger.log(`Updating order ${payment.orderId} to PAID`);
        await this.ordersService.updateState(
          payment.orderId,
          { state: OrderState.PAID },
          userId,
        );


        // Fetch order to get sellerId and amountAfterFee
        const paidOrder = await this.ordersRepository.findOne({ where: { id: payment.orderId } });

        // CREDIT seller's wallet with LOCKED funds (for payout after T+7)
        if (paidOrder && paidOrder.sellerId && paidOrder.totalAmount) {
          const totalAmount = Number(paidOrder.totalAmount);
          const fee = Math.floor(totalAmount * PLATFORM_FEE_PERCENT / 100);
          const sellerAmount = totalAmount - fee;
          this.logger.log(`[PLATFORM FEE DEBUG] Order total: ${totalAmount}, Fee: ${fee}, Seller amount: ${sellerAmount}`);

          // Seller gets net amount
          await this.walletsService.creditLocked(
            paidOrder.sellerId,
            paidOrder.id,
            sellerAmount,
            LedgerReason.ORDER_PAID,
          );
          this.logger.log(`[PLATFORM FEE DEBUG] Seller ledger entry created: sellerId=${paidOrder.sellerId}, orderId=${paidOrder.id}, amount=${sellerAmount}`);

          // Platform fee (tracked separately)
          await this.walletsService.creditPlatformFee(
            fee,
            paidOrder.id,
          );
          this.logger.log(`[PLATFORM FEE DEBUG] Platform ledger entry created: orderId=${paidOrder.id}, amount=${fee}`);
        }

        await this.eventBus.publish(
          'ORDER_PAID',
          'ORDER',
          payment.orderId,
          {
            orderId: payment.orderId,
            userId: userId,
            paymentId: payment.id,
            sellerId: paidOrder?.sellerId,
            amountAfterFee: paidOrder?.totalAmount, // Adjust if you have fee logic
          },
        );

        this.logger.log(`Payment verified and order marked as PAID: ${paymentId}`);
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason =String( gatewayResponse.message);
        await manager.save(Payment, payment);

        this.logger.warn(`Payment verification failed: ${paymentId}`);
      }

      return payment;
    });
  } catch (error) {
    this.logger.error(`Error in verifyPayment: ${error.message}`, error.stack);
    throw error;
  }
}

  async initiateRefund(
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Payment> {
    return await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException('Can only refund successful payments');
      }

      const refundAmount = amount || Number(payment.amount);
      const maxRefundable = Number(payment.amount) - Number(payment.refundAmount);

      if (refundAmount > maxRefundable) {
        throw new BadRequestException(
          `Cannot refund ${refundAmount}. Maximum refundable: ${maxRefundable}`,
        );
      }

      // Initiate refund with gateway
      const refundResponse = await this.mockGateway.initiateRefund(
        payment.gatewayTransactionId,
        refundAmount,
      );

      if (refundResponse.success) {
        payment.refundAmount = Number(payment.refundAmount) + refundAmount;
        payment.refundInitiatedAt = payment.refundInitiatedAt || new Date();
        payment.refundCompletedAt = new Date();
        payment.refundReference = refundResponse.refundId;

        // Update status
        if (payment.refundAmount >= Number(payment.amount)) {
          payment.status = PaymentStatus.REFUNDED;
        } else {
          payment.status = PaymentStatus.PARTIALLY_REFUNDED;
        }

        await manager.save(Payment, payment);

        this.logger.log(`Refund processed: ${refundAmount} for payment ${paymentId}`);

        return payment;
      } else {
        throw new BadRequestException(`Refund failed: ${refundResponse.message}`);
      }
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdempotencyKey(key: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { idempotencyKey: key },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}