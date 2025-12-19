import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WalletLedger, LedgerStatus } from './entities/wallet-ledger.entity';

@Injectable()
export class WalletCronService {
  private readonly logger = new Logger(WalletCronService.name);

  constructor(
    @InjectRepository(WalletLedger)
    private ledgerRepo: Repository<WalletLedger>,
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
    }

    this.logger.log(`Released ${lockedEntries.length} wallet entries`);
  }
}
