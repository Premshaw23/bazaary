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

  @Column({ name: 'category_id', nullable: true })
  @Index()
  categoryId: string;

  @Column({ name: 'mongo_ref', nullable: true })
  mongoRef: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}