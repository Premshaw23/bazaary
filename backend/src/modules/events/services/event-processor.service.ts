import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { OrderCreatedHandler } from '../handlers/order-created.handler';
import { OrderCancelledHandler } from '../handlers/order-cancelled.handler';

@Injectable()
export class EventProcessorService {
  private readonly logger = new Logger(EventProcessorService.name);
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly eventRepo: EventRepository,
    private readonly orderCreatedHandler: OrderCreatedHandler,
    private readonly orderCancelledHandler: OrderCancelledHandler,
  ) {}

  async process(): Promise<void> {
    const events = await this.eventRepo.findUnprocessed();

    for (const event of events) {
      try {
        this.logger.log(
          `Processing event ${event.eventType} (${event.id})`,
        );

        switch (event.eventType) {
          case 'ORDER_CREATED':
            await this.orderCreatedHandler.handle(event);
            break;
          case 'ORDER_CANCELLED':
            await this.orderCancelledHandler.handle(event);
            break;
        }

        event.processed = true;
        await this.eventRepo.save(event);
      } catch (error) {
        event.processingAttempts += 1;
        event.lastError = error.message;

        if (event.processingAttempts >= this.MAX_RETRIES) {
          this.logger.error(
            `Event ${event.id} failed permanently: ${error.message}`,
          );
        }
      }
    }
  }
}
