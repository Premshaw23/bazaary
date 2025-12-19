import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type' })
  eventType: string;

  @Column({ name: 'aggregate_type' })
  aggregateType: string;

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ default: false })
  processed: boolean;

  @Column({ name: 'processing_attempts', default: 0 })
  processingAttempts: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
