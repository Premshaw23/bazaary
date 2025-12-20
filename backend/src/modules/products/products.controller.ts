
import { Req } from '@nestjs/common';
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
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  async create(@Body() createProductDto: CreateProductDto, @Req() req) {
    try {
          const sellerId = req.user.userId;
      this.logger.log(`Creating product: ${JSON.stringify(createProductDto)} for seller ${sellerId}`);
      const result = await this.productsService.create({ ...createProductDto, sellerId });
      this.logger.log(`Product created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Error in products controller:', error);
      throw error;
    }
  }


  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async findMy(@Req() req) {
    // Assumes req.user.id is the seller's user id
    const sellerId = req.user.userId;
    this.logger?.debug?.(`findMy: sellerId from req.user.id = ${sellerId}`);
    // Validate sellerId is a valid UUID (simple regex check)
    if (!sellerId || !/^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(sellerId)) {
      throw new (require('@nestjs/common').BadRequestException)(`Invalid or missing sellerId in JWT payload: ${sellerId}`);
    }
    return this.productsService.findBySeller(sellerId);
  }

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('brand') brand?: string,
    @Query('search') search?: string,
  ) {
    return await this.productsService.findAll({ categoryId, brand, search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}