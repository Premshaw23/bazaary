
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ProductCondition } from '../../../database/entities/seller-listing.entity';

export class CreateListingDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  compareAtPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  lowStockThreshold?: number;

  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  @IsNumber()
  @IsOptional()
  @Min(0)
  warrantyMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  returnWindowDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  processingTimeHours?: number;
}