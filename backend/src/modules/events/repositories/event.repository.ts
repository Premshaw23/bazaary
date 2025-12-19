import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EventEntity } from '../../../database/entities/event.entity';

@Injectable()
export class EventRepository extends Repository<EventEntity> {
  constructor(dataSource: DataSource) {
    super(EventEntity, dataSource.createEntityManager());
  }

  findUnprocessed(limit = 10) {
    return this.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }
}
