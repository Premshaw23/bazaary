import { Controller, Post, Body, UseGuards, Req, Get, Inject, forwardRef } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { PayoutRequestDto } from './dto/payout-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from 'src/database/entities/user.entity';
import { Param } from '@nestjs/common';
import { SellersService } from '../sellers/sellers.service';

@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)

export class WalletsController {
  constructor(
    private walletsService: WalletsService,
    @Inject(forwardRef(() => SellersService)) private sellersService: SellersService,
  ) {}

  @Post('payout')
  @Roles(UserRole.SELLER)
  async requestPayout(@Req() req, @Body() dto: PayoutRequestDto) {
    // Look up seller by userId
    const seller = await this.sellersService.findByUserId(req.user.userId);
    if (!seller) {
      throw new Error('Seller profile not found for this user');
    }
    await this.walletsService.requestPayout(seller.id, dto.amount);
    return { status: 'PAYOUT_REQUESTED' };
  }

  // Wallet summary endpoint (GET)
  @UseGuards(JwtAuthGuard)
  @Get('summary/:sellerId')
  async getSummary(@Param('sellerId') sellerId: string) {
    // Optionally, restrict to self or admin
    return await this.walletsService.getSummary(sellerId);
  }

  @Post('unlock-for-test')
  @Roles(UserRole.ADMIN)
  async unlockForTest(@Body() body: { sellerId: string }) {
    await this.walletsService.unlockForTest(body.sellerId);
    return { status: 'UNLOCKED_FOR_TEST' };
  }


  @Post('admin/payout/approve')
  @Roles(UserRole.ADMIN)
  async approvePayout(@Body() body: { sellerId: string }) {
    await this.walletsService.approvePayout(body.sellerId);
    return { status: 'PAYOUT_COMPLETED' };
  }
  
}
