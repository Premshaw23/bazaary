
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  sku: string;

  @Column({ length: 500 })
  name: string;

  @Column({ nullable: true })
  brand: string;
  
  @Column({ name: 'seller_id' })
  sellerId: string;

  @Column({ name: 'category_id', nullable: true })
  @Index()
  categoryId: string;

  @Column({ name: 'mongo_ref', nullable: true })
  mongoRef: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}