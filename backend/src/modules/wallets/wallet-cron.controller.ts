import { Controller, Post } from '@nestjs/common';
import { WalletCronService } from './wallet-cron.service';

@Controller('wallets/cron')
export class WalletCronController {
  constructor(private readonly walletCronService: WalletCronService) {}

  @Post('release')
  async manualRelease() {
    await this.walletCronService.releaseLockedFunds();
    return { message: 'Manual release triggered' };
  }
}
