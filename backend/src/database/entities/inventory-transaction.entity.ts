import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SellerListing } from './seller-listing.entity';

export enum InventoryTransactionType {
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
  RESERVED = 'RESERVED',
  RELEASED = 'RELEASED',
  ADJUSTMENT = 'ADJUSTMENT',
  DAMAGED = 'DAMAGED',
  RETURNED = 'RETURNED',
}

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'listing_id' })
  @Index()
  listingId: string;

  @ManyToOne(() => SellerListing)
  @JoinColumn({ name: 'listing_id' })
  listing: SellerListing;

  @Column({
    type: 'enum',
    enum: InventoryTransactionType,
  })
  @Index()
  type: InventoryTransactionType;

  @Column()
  quantity: number;

  @Column({ name: 'order_id', nullable: true })
  @Index()
  orderId: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'previous_quantity' })
  previousQuantity: number;

  @Column({ name: 'new_quantity' })
  newQuantity: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}