import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  async addMailJob(data: any) {
    await this.mailQueue.add('send-mail', data);
  }
}
