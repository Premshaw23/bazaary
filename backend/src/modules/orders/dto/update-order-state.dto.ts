import { IsEnum, IsString, IsOptional } from 'class-validator';
import { OrderState } from '../../../database/entities/order.entity';

export class UpdateOrderStateDto {
  @IsEnum(OrderState)
  state: OrderState;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  carrier?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}