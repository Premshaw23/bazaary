import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStateDto } from './dto/update-order-state.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { OrderState } from '../../database/entities/order.entity';
import { SellersService } from '../sellers/sellers.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly sellersService: SellersService,
  ) {}

  @Post()
  @Roles(UserRole.BUYER, UserRole.SELLER)
  @UseGuards(RolesGuard)
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('state') state?: OrderState,
  ) {
    // Buyers see their orders, sellers see orders for them
    const seller = await this.sellersService.findByUserId(req.user.userId);

    const filters: any = {};

    if (seller) {
      filters.sellerId = seller.id;
    } else {
      filters.buyerId = req.user.userId;
    }

    if (state) {
      filters.state = state;
    }

    return await this.ordersService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findOne(id);

    // Authorization check
    const seller = await this.sellersService.findByUserId(req.user.userId);
    const isAuthorized =
      order.buyerId === req.user.userId ||
      (seller && order.sellerId === seller.id) ||
      req.user.role === UserRole.ADMIN;

    if (!isAuthorized) {
      throw new UnauthorizedException('Not authorized to view this order');
    }

    return order;
  }

  @Get(':id/items')
  async getItems(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findOne(id);

    // Authorization check
    const seller = await this.sellersService.findByUserId(req.user.userId);
    const isAuthorized =
      order.buyerId === req.user.userId ||
      (seller && order.sellerId === seller.id) ||
      req.user.role === UserRole.ADMIN;

    if (!isAuthorized) {
      throw new UnauthorizedException('Not authorized to view this order');
    }

    return await this.ordersService.getOrderItems(id);
  }

  @Patch(':id/state')
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateState(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStateDto,
    @Request() req,
  ) {
    const order = await this.ordersService.findOne(id);

    // Sellers can only update their own orders
    if (req.user.role === UserRole.SELLER) {
      const seller = await this.sellersService.findByUserId(req.user.userId);
      if (!seller || order.sellerId !== seller.id) {
        throw new UnauthorizedException('Not authorized to update this order');
      }
    }

    return await this.ordersService.updateState(id, updateDto, req.user.userId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const order = await this.ordersService.findOne(id);

    // Buyers can cancel their own orders, sellers/admin can cancel any
    const seller = await this.sellersService.findByUserId(req.user.userId);
    const isAuthorized =
      order.buyerId === req.user.userId ||
      (seller && order.sellerId === seller.id) ||
      req.user.role === UserRole.ADMIN;

    if (!isAuthorized) {
      throw new UnauthorizedException('Not authorized to cancel this order');
    }

    return await this.ordersService.cancel(id, reason, req.user.userId);
  }
}