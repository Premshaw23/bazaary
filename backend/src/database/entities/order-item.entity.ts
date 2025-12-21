import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { SellerListing } from './seller-listing.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'listing_id' })
  @Index()
  listingId: string;

  @ManyToOne(() => SellerListing)
  @JoinColumn({ name: 'listing_id' })
  listing: SellerListing;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Snapshot at order time (immutable)
  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'product_sku' })
  productSku: string;

  @Column({ name: 'variant_details', type: 'jsonb', nullable: true })
  variantDetails: Record<string, string>;

  @Column()
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  // Item-level fulfillment
  @Column({ name: 'fulfilled_quantity', default: 0 })
  fulfilledQuantity: number;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}