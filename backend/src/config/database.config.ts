import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Seller } from '../database/entities/seller.entity';
import { Product } from '../database/entities/product.entity';
import { SellerListing } from '../database/entities/seller-listing.entity';
import { InventoryTransaction } from '../database/entities/inventory-transaction.entity';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Payment } from '../database/entities/payment.entity';

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string) || 5432,
  username: process.env.DB_USER || 'bazaary',
  password: process.env.DB_PASSWORD || 'bazaary_secret',
  database: process.env.DB_NAME || 'bazaary_db',
  entities: [
    User,
    Seller,
    Product,
    SellerListing,
    InventoryTransaction,
    Order,
    OrderItem,
    Payment,
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};

export const mongooseConfig = {
  uri:
    process.env.MONGO_URI ||
    'mongodb://bazaary:bazaary_secret@localhost:27017/bazaary_catalog?authSource=admin',
};