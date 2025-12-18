import { IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '../../../database/entities/payment.entity';

export class InitiatePaymentDto {
  @IsString()
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}