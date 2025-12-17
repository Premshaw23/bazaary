import { IsString, IsNumber, Min } from 'class-validator';

export class ReserveStockDto {
  @IsString()
  listingId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  orderId: string;
}