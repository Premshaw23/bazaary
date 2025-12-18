import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum PaymentMethod {
  CARD = 'CARD',
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
  COD = 'COD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Payment Gateway
  @Column({ name: 'payment_gateway', nullable: true })
  paymentGateway: string; // 'RAZORPAY', 'STRIPE', 'MOCK'

  @Column({ name: 'gateway_transaction_id', unique: true, nullable: true })
  @Index()
  gatewayTransactionId: string;

  @Column({ name: 'gateway_order_id', nullable: true })
  gatewayOrderId: string;

  // Payment Details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  @Index()
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  status: PaymentStatus;

  // Idempotency
  @Column({ name: 'idempotency_key', unique: true })
  @Index()
  idempotencyKey: string;

  // Refund
  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  refundAmount: number;

  @Column({ name: 'refund_initiated_at', nullable: true })
  refundInitiatedAt: Date;

  @Column({ name: 'refund_completed_at', nullable: true })
  refundCompletedAt: Date;

  @Column({ name: 'refund_reference', nullable: true })
  refundReference: string;

  // Metadata
  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any>;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;
}