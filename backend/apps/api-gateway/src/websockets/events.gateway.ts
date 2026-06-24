import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this for production
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (data && data.userId) {
      client.join(data.userId);
      console.log(`Client ${client.id} registered for user ${data.userId}`);
    }
  }

  @SubscribeMessage('joinCommunityChat')
  handleJoinCommunityChat(@ConnectedSocket() client: Socket, @MessageBody() data: { communityId: string }) {
    if (data && data.communityId) {
      client.join(`community_chat_${data.communityId}`);
      console.log(`Client ${client.id} joined chat room community_chat_${data.communityId}`);
    }
  }

  @SubscribeMessage('leaveCommunityChat')
  handleLeaveCommunityChat(@ConnectedSocket() client: Socket, @MessageBody() data: { communityId: string }) {
    if (data && data.communityId) {
      client.leave(`community_chat_${data.communityId}`);
      console.log(`Client ${client.id} left chat room community_chat_${data.communityId}`);
    }
  }

  emitToUser(userId: string, eventName: string, payload: any) {
    this.server.to(userId).emit(eventName, payload);
  }

  emitToRoom(room: string, eventName: string, payload: any) {
    this.server.to(room).emit(eventName, payload);
  }
}
