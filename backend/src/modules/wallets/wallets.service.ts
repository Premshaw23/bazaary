import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerWallet } from './entities/seller-wallet.entity';
import { WalletLedger, LedgerStatus, LedgerType, LedgerReason } from './entities/wallet-ledger.entity';

const PLATFORM_USER_ID = '00000000-0000-0000-0000-000000000000'; // Define a constant for the platform user ID

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
    reason: LedgerReason,
  ) {
    console.log('[creditLocked] Called with:', { sellerId, orderId, amount, reason });
    // Extra debug: print all LOCKED and AVAILABLE ledger entries for this seller/order
    const debugRows = await this.ledgerRepo.find({ where: { sellerId, orderId } });
    console.log('[creditLocked][DEBUG] Existing ledger rows for seller/order:', debugRows);
    const existing = await this.ledgerRepo.findOne({
      where: { orderId, reason },
    });
    if (existing) {
      console.log('[creditLocked] Existing ledger entry found, skipping:', existing);
      return; // 🔒 replay-safe
    }
    const entry = this.ledgerRepo.create({
      sellerId,
      orderId,
      amount,
      type: LedgerType.CREDIT,
      status: LedgerStatus.LOCKED,
      reason,
    });
    try {
      const saved = await this.ledgerRepo.save(entry);
      console.log('[creditLocked] LOCKED ledger entry saved:', saved);
    } catch (err) {
      console.error('[creditLocked] Error saving ledger entry:', err);
      throw err;
    }
  }

  async releaseToAvailable(orderId: string) {
    await this.ledgerRepo.update(
      { orderId, status: LedgerStatus.LOCKED },
      { status: LedgerStatus.AVAILABLE },
    );
  }

  async creditPlatformFee(amount: number, orderId: string) {
    const ledgerEntry = this.ledgerRepo.create({
      sellerId: PLATFORM_USER_ID, // platform-owned
      orderId,
      amount,
      type: LedgerType.CREDIT,
      status: LedgerStatus.AVAILABLE,
      reason: LedgerReason.PLATFORM_FEE,
    });
    await this.ledgerRepo.save(ledgerEntry);
  }

  async getSummary(sellerId: string) {
    try {
      const rows = await this.ledgerRepo.find({ where: { sellerId } });
      // Ignore platform fee rows (sellerId = null)
      const sellerRows = rows.filter(r => r.sellerId !== null);
      if (!sellerRows || sellerRows.length === 0) {
        // Log and return a clear error if no ledger entries found
        console.warn(`[WalletsService] No ledger entries found for sellerId: ${sellerId}`);
        return { locked: 0, available: 0, message: 'No ledger entries found for this seller.' };
      }

      let locked = 0;
      let available = 0;

      for (const r of sellerRows) {
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
            reason: LedgerReason.PAYOUT_REQUEST,
          }));
          remaining = 0;
        }
      }
      const after = await this.ledgerRepo.find({ where: { sellerId } });
      console.log('[requestPayout] Ledger rows AFTER payout:', after);
      // No separate debit entry needed; funds are now marked as paid out
      // Payout is now immediate after unlock
    }

    async getPlatformLedger() {
      return this.ledgerRepo.find({ where: { sellerId: PLATFORM_USER_ID } });
    }

    // Wallet Ledger History API
    async getLedger(sellerId: string, limit = 20) {
      return this.ledgerRepo.find({
        where: { sellerId },
        order: { createdAt: 'DESC' },
        take: limit,
      });
    }
}
