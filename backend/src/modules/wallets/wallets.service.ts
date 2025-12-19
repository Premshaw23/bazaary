
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerWallet } from './entities/seller-wallet.entity';
import { WalletLedger, LedgerStatus, LedgerType } from './entities/wallet-ledger.entity';


@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(SellerWallet)
    private walletRepo: Repository<SellerWallet>,
    @InjectRepository(WalletLedger)
    private ledgerRepo: Repository<WalletLedger>,
  ) {}

  // For test only: unlock all LOCKED ledger entries for a seller
  async unlockForTest(sellerId: string) {
    try {
      const before = await this.ledgerRepo.find({ where: { sellerId } });
      console.log('[unlockForTest] Ledger rows BEFORE unlock:', before);
      const result = await this.ledgerRepo.update(
        { sellerId, status: LedgerStatus.LOCKED },
        { status: LedgerStatus.AVAILABLE },
      );
      console.log('[unlockForTest] Updated rows:', result);
      const after = await this.ledgerRepo.find({ where: { sellerId } });
      console.log('[unlockForTest] Ledger rows AFTER unlock:', after);
      // Print all rows with status AVAILABLE for this seller
      const availableRows = await this.ledgerRepo.find({ where: { sellerId, status: LedgerStatus.AVAILABLE } });
      console.log('[unlockForTest] AVAILABLE rows after unlock:', availableRows);

      // Print ALL wallet ledger rows in the database (for sellerId mismatch debug)
      const allRows = await this.ledgerRepo.find();
      console.log('[unlockForTest] ALL wallet ledger rows in DB:', allRows);
    } catch (err) {
      console.error('[unlockForTest] Error:', err);
      throw err;
    }
  }

  async getOrCreateWallet(sellerId: string): Promise<SellerWallet> {
    let wallet = await this.walletRepo.findOne({ where: { sellerId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ sellerId });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async creditLocked(
    sellerId: string,
    orderId: string,
    amount: number,
    reason: string,
  ) {
    await this.getOrCreateWallet(sellerId);

    const entry = this.ledgerRepo.create({
      sellerId,
      orderId,
      amount,
      type: LedgerType.CREDIT,
      status: LedgerStatus.LOCKED,
      reason,
    });
    console.log('[creditLocked] Creating LOCKED ledger entry:', entry);
    await this.ledgerRepo.save(entry);
    console.log('[creditLocked] LOCKED ledger entry saved for sellerId:', sellerId, 'orderId:', orderId, 'amount:', amount);
  }

  async releaseToAvailable(orderId: string) {
    await this.ledgerRepo.update(
      { orderId, status: LedgerStatus.LOCKED },
      { status: LedgerStatus.AVAILABLE },
    );
  }

  async getSummary(sellerId: string) {
    try {
      const rows = await this.ledgerRepo.find({ where: { sellerId } });
      if (!rows || rows.length === 0) {
        // Log and return a clear error if no ledger entries found
        console.warn(`[WalletsService] No ledger entries found for sellerId: ${sellerId}`);
        return { locked: 0, available: 0, message: 'No ledger entries found for this seller.' };
      }

      let locked = 0;
      let available = 0;

      for (const r of rows) {
        if (r.status === LedgerStatus.LOCKED) locked += Number(r.amount);
        if (r.status === LedgerStatus.AVAILABLE) available += Number(r.amount);
      }

      return { locked, available };
    } catch (err) {
      console.error(`[WalletsService] Error in getSummary for sellerId ${sellerId}:`, err);
      throw err;
    }
  }


    async approvePayout(sellerId: string) {
      await this.ledgerRepo.update(
        { sellerId, status: LedgerStatus.AVAILABLE },
        { status: LedgerStatus.PAID_OUT },
      );
    }

    async requestPayout(sellerId: string, amount: number) {

      // Print all ledger rows for this seller before filtering
      const allRows = await this.ledgerRepo.find({ where: { sellerId } });
      console.log('[requestPayout] ALL ledger rows for seller before payout:', allRows);

      // Find all AVAILABLE ledger rows for this seller
      const before = allRows;
      const availableRows = await this.ledgerRepo.find({
        where: { sellerId, status: LedgerStatus.AVAILABLE },
        order: { createdAt: 'ASC' },
      });
      const totalAvailable = availableRows.reduce((sum, row) => sum + Number(row.amount), 0);
      console.log('[requestPayout] AVAILABLE ledger rows:', availableRows);
      console.log('[requestPayout] sellerId:', sellerId, 'requested:', amount, 'available:', totalAvailable);

      if (amount > totalAvailable) {
        const { BadRequestException } = require('@nestjs/common');
        throw new BadRequestException('Insufficient available balance');
      }

      // Mark AVAILABLE rows as PAID_OUT up to the requested amount
      let remaining = amount;
      for (const row of availableRows) {
        if (remaining <= 0) break;
        const rowAmount = Number(row.amount);
        if (rowAmount <= remaining) {
          await this.ledgerRepo.update(row.id, { status: LedgerStatus.PAID_OUT });
          remaining -= rowAmount;
        } else {
          // Split the row: mark part as PAID_OUT, part as AVAILABLE
          await this.ledgerRepo.update(row.id, { amount: rowAmount - remaining });
          await this.ledgerRepo.save(this.ledgerRepo.create({
            sellerId,
            amount: remaining,
            type: row.type,
            status: LedgerStatus.PAID_OUT,
            reason: 'PAYOUT_REQUEST',
          }));
          remaining = 0;
        }
      }
      const after = await this.ledgerRepo.find({ where: { sellerId } });
      console.log('[requestPayout] Ledger rows AFTER payout:', after);
      // No separate debit entry needed; funds are now marked as paid out
      // Payout is now immediate after unlock
    }
}
