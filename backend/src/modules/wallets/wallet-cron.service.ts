import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WalletLedger, LedgerStatus } from './entities/wallet-ledger.entity';
import { NotificationsService } from '../notifications/notifications.service';

import { Seller } from '../../database/entities/seller.entity';

@Injectable()
export class WalletCronService {
  private readonly logger = new Logger(WalletCronService.name);

  constructor(
    @InjectRepository(WalletLedger)
    private ledgerRepo: Repository<WalletLedger>,
    @InjectRepository(Seller)
    private sellerRepo: Repository<Seller>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Runs every hour
  @Cron('0 * * * *')
  async releaseLockedFunds() {
    const holdPeriodDays = 7;
    const releaseBefore = new Date();
    releaseBefore.setDate(releaseBefore.getDate() - holdPeriodDays);

    const lockedEntries = await this.ledgerRepo.find({
      where: {
        status: LedgerStatus.LOCKED,
        createdAt: LessThan(releaseBefore),
      },
    });

    if (!lockedEntries.length) return;

    for (const entry of lockedEntries) {
      entry.status = LedgerStatus.AVAILABLE;
      await this.ledgerRepo.save(entry);

      // Notify the seller
      if (entry.sellerId) {
        try {
          const seller = await this.sellerRepo.findOne({ 
            where: { id: entry.sellerId } 
          });
          
          if (seller) {
            this.notificationsService.notifyUser(
              seller.userId,
              'Funds Released 💰',
              `$${entry.amount} has been released to your available balance.`,
              'success'
            );
            this.notificationsService.emitWalletUpdate(seller.userId, 0); // Trigger a refresh
          }
        } catch (e) {
          this.logger.error(`Failed to notify seller ${entry.sellerId}: ${e.message}`);
        }
      }
    }

    this.logger.log(`Released ${lockedEntries.length} wallet entries`);
  }
}
