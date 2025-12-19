import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { EventRepository } from './repositories/event.repository';
import { EventBusService } from './services/event-bus.service';
import { EventProcessorService } from './services/event-processor.service';
import { EventReplayService } from './services/event-replay.service';
import { OrderCreatedHandler } from './handlers/order-created.handler';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderCancelledHandler } from './handlers/order-cancelled.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]), // ✅ REQUIRED
    InventoryModule,
  ],
  providers: [
    EventRepository,      // 🔥 THIS IS CRITICAL
    EventBusService,
    EventProcessorService,
    EventReplayService,
    OrderCreatedHandler,
    OrderCancelledHandler,
  ],
  exports: [
    EventBusService,      // ✅ ONLY export the service
  ],
})
export class EventsModule {}
