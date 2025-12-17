import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { VerifySellerDto } from './dto/verify-seller.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { SellerLifecycle } from '../../database/entities/seller.entity';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async apply(@Request() req, @Body() createSellerDto: CreateSellerDto) {
    return await this.sellersService.create(req.user.userId, createSellerDto);
  }

  // ✅ Public route - no authentication required
  @Get()
  async findAll(
    @Query('lifecycleState') lifecycleState?: SellerLifecycle,
    @Query('featured') featured?: string,
    @Query('verifiedBadge') verifiedBadge?: string,
  ) {
    const filters: any = {};

    if (lifecycleState) {
      filters.lifecycleState = lifecycleState;
    }

    if (featured !== undefined) {
      filters.featured = featured === 'true';
    }

    if (verifiedBadge !== undefined) {
      filters.verifiedBadge = verifiedBadge === 'true';
    }

    return await this.sellersService.findAll(filters);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async getMyProfile(@Request() req) {
    return await this.sellersService.findByUserId(req.user.userId);
  }

  // ✅ Public route - no authentication required
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.sellersService.findOne(id);
  }

  // ✅ Public route - no authentication required
  @Get(':id/metrics')
  async getMetrics(@Param('id') id: string) {
    return await this.sellersService.getMetrics(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
    @Request() req,
  ) {
    // Ensure seller can only update their own profile
    const seller = await this.sellersService.findOne(id);
    if (seller.userId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    return await this.sellersService.update(id, updateSellerDto);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async verify(
    @Param('id') id: string,
    @Body() verifyDto: VerifySellerDto,
    @Request() req,
  ) {
    return await this.sellersService.updateLifecycleState(
      id,
      verifyDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.sellersService.remove(id);
  }
}