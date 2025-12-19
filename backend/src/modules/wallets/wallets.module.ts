import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerWallet } from './entities/seller-wallet.entity';
import { WalletLedger } from './entities/wallet-ledger.entity';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { WalletCronService } from './wallet-cron.service';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerWallet, WalletLedger]),
    forwardRef(() => SellersModule),
  ],
  providers: [WalletsService, WalletCronService],
  controllers: [WalletsController],
  exports: [WalletsService, TypeOrmModule],
})
export class WalletsModule {}
