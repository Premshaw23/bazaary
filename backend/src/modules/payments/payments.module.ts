import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../database/entities/payment.entity';
import { Order } from '../../database/entities/order.entity';
import { MockPaymentGateway } from './gateways/mock.gateway';
import { OrdersModule } from '../orders/orders.module';
import { EventsModule } from '../events/events.module';
import { WalletsService } from '../wallets/wallets.service';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    OrdersModule,
    EventsModule,
    WalletsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentGateway, WalletsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}