import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { ListingsService } from '../listings/listings.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly listingsService: ListingsService,
  ) {}

  @Post(':listingId/adjust')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async adjust(
    @Param('listingId') listingId: string,
    @Body() adjustDto: AdjustStockDto,
    @Request() req,
  ) {
    const listing = await this.listingsService.findOne(listingId);
    return await this.inventoryService.adjust(listingId, adjustDto, req.user.userId);
  }

  @Get(':listingId/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async getTransactions(@Param('listingId') listingId: string) {
    return await this.inventoryService.getTransactions(listingId);
  }

  // ✅ PUBLIC ROUTE - No auth required
  @Get(':listingId/available')
  async getAvailable(@Param('listingId') listingId: string) {
    return {
      listingId,
      availableStock: await this.inventoryService.getAvailableStock(listingId),
    };
  }
}