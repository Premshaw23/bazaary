import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStateMachineService } from './order-state-machine.service';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { ListingsModule } from '../listings/listings.module';
import { ProductsModule } from '../products/products.module';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    InventoryModule,
    ListingsModule,
    ProductsModule,
    SellersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderStateMachineService],
  exports: [OrdersService],
})
export class OrdersModule {}