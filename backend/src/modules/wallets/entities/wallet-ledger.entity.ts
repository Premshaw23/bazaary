import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LedgerType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum LedgerStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  PAID_OUT = 'PAID_OUT',
}

@Entity('wallet_ledger')
@Index(['sellerId'])
@Index(['orderId'])
export class WalletLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: LedgerType })
  type: LedgerType;

  @Column({ type: 'enum', enum: LedgerStatus })
  status: LedgerStatus;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
