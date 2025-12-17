import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum SellerLifecycle {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum BusinessType {
  INDIVIDUAL = 'INDIVIDUAL',
  PARTNERSHIP = 'PARTNERSHIP',
  COMPANY = 'COMPANY',
  PROPRIETORSHIP = 'PROPRIETORSHIP',
}

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'business_name' })
  businessName: string;

  @Column({
    name: 'business_type',
    type: 'enum',
    enum: BusinessType,
    nullable: true,
  })
  businessType: BusinessType;

  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  // Lifecycle
  @Column({
    name: 'lifecycle_state',
    type: 'enum',
    enum: SellerLifecycle,
    default: SellerLifecycle.APPLIED,
  })
  @Index()
  lifecycleState: SellerLifecycle;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy: string;

  // Business Details
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  // Banking
  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_ifsc', nullable: true })
  bankIfsc: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  // Metrics (computed periodically)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  @Index()
  rating: number;

  @Column({ name: 'total_orders', default: 0 })
  totalOrders: number;

  @Column({ name: 'fulfilled_orders', default: 0 })
  fulfilledOrders: number;

  @Column({
    name: 'return_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.0,
  })
  returnRate: number;

  @Column({ name: 'average_fulfillment_time', nullable: true })
  averageFulfillmentTime: number; // in hours

  @Column({ name: 'reliability_score', default: 0 })
  reliabilityScore: number; // 0-100

  // Flags
  @Column({ default: false })
  featured: boolean;

  @Column({ name: 'verified_badge', default: false })
  verifiedBadge: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}