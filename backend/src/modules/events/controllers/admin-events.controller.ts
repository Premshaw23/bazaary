import { Controller, Post, Param } from '@nestjs/common';
import { EventReplayService } from '../services/event-replay.service';

@Controller('admin/events')
export class AdminEventsController {
  constructor(private readonly replayService: EventReplayService) {}

  @Post('replay/:aggregateType/:aggregateId')
  replayAggregate(
    @Param('aggregateType') aggregateType: string,
    @Param('aggregateId') aggregateId: string,
  ) {
    return this.replayService.replayByAggregate(
      aggregateType,
      aggregateId,
    );
  }

  @Post('replay-failed')
  replayFailed() {
    return this.replayService.replayFailed();
  }
}
