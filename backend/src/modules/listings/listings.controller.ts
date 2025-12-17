import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { ListingStatus } from '../../database/entities/seller-listing.entity';
import { SellersService } from '../sellers/sellers.service';

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly sellersService: SellersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async create(@Request() req, @Body() createListingDto: CreateListingDto) {
    const seller = await this.sellersService.findByUserId(req.user.userId);
    
    if (!seller) {
      throw new UnauthorizedException('Seller profile not found');
    }

    return await this.listingsService.create(seller.id, createListingDto);
  }

  @Get()
  async findAll(
    @Query('sellerId') sellerId?: string,
    @Query('productId') productId?: string,
    @Query('status') status?: ListingStatus,
  ) {
    return await this.listingsService.findAll({ sellerId, productId, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.listingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async update(
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
    @Request() req,
  ) {
    const listing = await this.listingsService.findOne(id);
    const seller = await this.sellersService.findByUserId(req.user.userId);

    if (listing.sellerId !== seller?.id) {
      throw new UnauthorizedException('You can only update your own listings');
    }

    return await this.listingsService.update(id, updateListingDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ListingStatus,
    @Request() req,
  ) {
    const listing = await this.listingsService.findOne(id);
    const seller = await this.sellersService.findByUserId(req.user.userId);

    if (listing.sellerId !== seller?.id) {
      throw new UnauthorizedException('You can only update your own listings');
    }

    return await this.listingsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const listing = await this.listingsService.findOne(id);
    const seller = await this.sellersService.findByUserId(req.user.userId);

    if (req.user.role !== UserRole.ADMIN && listing.sellerId !== seller?.id) {
      throw new UnauthorizedException('You can only delete your own listings');
    }

    return await this.listingsService.remove(id);
  }
}