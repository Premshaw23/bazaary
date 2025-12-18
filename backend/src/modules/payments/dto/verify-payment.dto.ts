import { IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  transactionId: string;

  @IsString()
  paymentId: string;
}