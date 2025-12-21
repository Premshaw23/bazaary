import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Seller } from './seller.entity';

export enum OrderState {
  CREATED = 'CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURN_APPROVED = 'RETURN_APPROVED',
  RETURNED = 'RETURNED',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  @Index()
  orderNumber: string; // BAZ-2024-000001

  // Parties
  @Column({ name: 'buyer_id' })
  @Index()
  buyerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'seller_id' })
  @Index()
  sellerId: string;

  @ManyToOne(() => Seller)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller;

  // State Management
  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.CREATED,
  })
  @Index()
  state: OrderState;

  @Column({
    name: 'previous_state',
    type: 'enum',
    enum: OrderState,
    nullable: true,
  })
  previousState: OrderState;

  @Column({ name: 'state_changed_at', default: () => 'NOW()' })
  stateChangedAt: Date;

  // Amounts
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'shipping_charge', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCharge: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  // Addresses
  @Column({ name: 'shipping_address', type: 'jsonb' })
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  // Fulfillment
  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ name: 'actual_delivery_date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  carrier: string;

  // Metadata
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'return_reason', type: 'text', nullable: true })
  returnReason: string;

  // Timestamps
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({ name: 'confirmed_at', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'shipped_at', nullable: true })
  shippedAt: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt: Date;
}