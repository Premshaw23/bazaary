import { Controller, Post, Body, Param } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsGateway: NotificationsGateway) {}

  @Post('test/:userId')
  async sendTestNotification(
    @Param('userId') userId: string,
    @Body() body: { message?: string; type?: string },
  ) {
    const message = body.message || 'This is a test notification! 🎉';
    const type = body.type || 'success';

    this.notificationsGateway.sendToUser(userId, 'notification', {
      title: '🔔 Test Notification',
      message,
      type,
    });

    return { 
      success: true, 
      message: 'Notification sent!',
      sentTo: userId 
    };
  }

  @Post('broadcast')
  async sendBroadcast(@Body() body: { message?: string }) {
    const message = body.message || 'Broadcast notification to all users! 📢';

    this.notificationsGateway.sendToAll('notification', {
      title: '📢 System Announcement',
      message,
      type: 'info',
    });

    return { success: true, message: 'Broadcast sent to all connected users!' };
  }
}
