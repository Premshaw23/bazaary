import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../database/entities/payment.entity';
import { Order } from '../../database/entities/order.entity';
import { MockPaymentGateway } from './gateways/mock.gateway';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    OrdersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}