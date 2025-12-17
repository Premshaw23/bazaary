import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SellerLifecycle } from '../../../database/entities/seller.entity';

export class VerifySellerDto {
  @IsEnum(SellerLifecycle)
  lifecycleState: SellerLifecycle;

  @IsString()
  @IsOptional()
  notes?: string;
}