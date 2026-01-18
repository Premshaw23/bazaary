import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth.token?.split(' ')[1];

      // If no auth token, check cookies
      if (!token && client.handshake.headers.cookie) {
        const cookies = client.handshake.headers.cookie
          .split(';')
          .reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as any);
        token = cookies['access_token'];
      }

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token found`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.join(`user_${payload.sub}`);
      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (err) {
      this.logger.error(`Connection error: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
