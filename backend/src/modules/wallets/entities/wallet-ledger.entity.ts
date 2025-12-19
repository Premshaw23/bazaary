import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LedgerReason {
  ORDER_PAID = 'ORDER_PAID',
  PLATFORM_FEE = 'PLATFORM_FEE',
  PAYOUT = 'PAYOUT',
  PAYOUT_REQUEST = 'PAYOUT_REQUEST',
}

export enum LedgerType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum LedgerStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  PAID_OUT = 'PAID_OUT',
}

@Index(['sellerId'])
@Index(['orderId', 'reason'], { unique: true })
@Entity('wallet_ledger')
export class WalletLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  sellerId: string | null;

  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: LedgerType })
  type: LedgerType;

  @Column({ type: 'enum', enum: LedgerStatus })
  status: LedgerStatus;

  @Column({ type: 'enum', enum: LedgerReason })
  reason: LedgerReason;

  @CreateDateColumn()
  createdAt: Date;
}
