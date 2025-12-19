import { Controller, Post, Body, UseGuards, Req, Get, Inject, forwardRef, Query } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { PayoutRequestDto } from './dto/payout-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from 'src/database/entities/user.entity';
import { Param } from '@nestjs/common';
import { SellersService } from '../sellers/sellers.service';
import { LedgerReason } from './entities/wallet-ledger.entity';

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
   @Get('summary')
  @Roles(UserRole.SELLER)
  async walletSummary(@Req() req) {
    const seller = await this.sellersService.findByUserId(req.user.userId);
    if (!seller) throw new Error('Seller profile not found for this user');
    return this.walletsService.getSummary(seller.id);
  }

    // Wallet summary by sellerId (for admin or direct lookup)
  @Get('summary/:sellerId')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  async walletSummaryBySellerId(@Param('sellerId') sellerId: string) {
    return this.walletsService.getSummary(sellerId);
  }

  @Post('unlock-for-test')
  @Roles(UserRole.ADMIN)
  async unlockForTest(@Body() body: { sellerId: string }) {
    await this.walletsService.unlockForTest(body.sellerId);
    return { status: 'UNLOCKED_FOR_TEST' };
  }

  @Get('platform-ledger')
  @Roles(UserRole.ADMIN)
  async getPlatformLedger() {
    try {
      return await this.walletsService.getPlatformLedger();
    } catch (err) {
      console.error('Platform ledger error:', err);
      throw err;
    }
  }


  @Get('ledger')
  @Roles(UserRole.SELLER)
  async ledger(@Req() req, @Query('limit') limit?: string) {
    const seller = await this.sellersService.findByUserId(req.user.userId);
    if (!seller) throw new Error('Seller profile not found for this user');
    return this.walletsService.getLedger(seller.id, Number(limit || 20));
  }

  @Post('admin/payout/approve')
  @Roles(UserRole.ADMIN)
  async approvePayout(@Body() body: { sellerId: string }) {
    await this.walletsService.approvePayout(body.sellerId);
    return { status: 'PAYOUT_COMPLETED' };
  }
  
}
