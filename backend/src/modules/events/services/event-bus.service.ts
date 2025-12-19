import { Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';

@Injectable()
export class EventBusService {
  constructor(private readonly eventRepo: EventRepository) {}

  async publish(
    eventType: string,
    aggregateType: string,
    aggregateId: string,
    payload: any,
    metadata: any = {},
  ) {
    const event = this.eventRepo.create({
      eventType,
      aggregateType,
      aggregateId,
      payload,
      metadata,
    });

    await this.eventRepo.save(event);
    return event;
  }
}
