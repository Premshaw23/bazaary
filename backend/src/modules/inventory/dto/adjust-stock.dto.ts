import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { InventoryTransactionType } from '../../../database/entities/inventory-transaction.entity';

export class AdjustStockDto {
  @IsNumber()
  quantity: number;

  @IsEnum(InventoryTransactionType)
  type: InventoryTransactionType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  referenceId?: string;
}