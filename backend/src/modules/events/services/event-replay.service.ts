import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';

@Injectable()
export class EventReplayService {
  private readonly logger = new Logger(EventReplayService.name);

  constructor(private readonly eventRepo: EventRepository) {}

  /**
   * Replay all events for a given aggregate (ORDER, PAYMENT, etc.)
   */
  async replayByAggregate(
    aggregateType: string,
    aggregateId: string,
  ): Promise<{ replayed: number }> {
    const result = await this.eventRepo.update(
      { aggregateType, aggregateId },
      {
        processed: false,
        processingAttempts: 0,
        lastError: '',
      },
    );

    this.logger.warn(
      `Replaying ${result.affected ?? 0} events for ${aggregateType}:${aggregateId}`,
    );

    return { replayed: result.affected ?? 0 };
  }

  /**
   * Replay ALL failed events (admin emergency tool)
   */
  async replayFailed(): Promise<{ replayed: number }> {
    const result = await this.eventRepo.update(
      { processed: false },
      {
        processingAttempts: 0,
        lastError: '',
      },
    );

    this.logger.warn(`Replaying ${result.affected ?? 0} failed events`);

    return { replayed: result.affected ?? 0 };
  }
}
