import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  notifyUser(userId: string, title: string, message: string, type: string = 'info') {
    this.gateway.sendToUser(userId, 'notification', {
      title,
      message,
      type,
      timestamp: new Date(),
    });
  }

  notifyAll(title: string, message: string, type: string = 'info') {
    this.gateway.sendToAll('notification', {
      title,
      message,
      type,
      timestamp: new Date(),
    });
  }
  
  emitOrderUpdate(userId: string, orderId: string, status: string) {
    this.gateway.sendToUser(userId, 'order_update', { orderId, status });
  }

  emitWalletUpdate(userId: string, balance: number) {
    this.gateway.sendToUser(userId, 'wallet_update', { balance });
  }
}
