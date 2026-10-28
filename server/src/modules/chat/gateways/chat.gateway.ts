import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { ChatService } from '../services';
import { SendMessageDto, TypingDto } from '../models/dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
@UsePipes(new ValidationPipe({ transform: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  // Handle client connection (event)
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;
    if (!userId || !role) {
      this.logger.warn(
        `Connection rejected for socket ${client.id}: Missing userId or role`,
      );
      client.disconnect();
      return;
    }

    // Save user info directly on socket instance for subsequent events
    client.data.userId = userId;
    client.data.role = role;
    this.logger.log(
      `Client connected successfully: ID = ${userId}, Role = ${role} (Socket ID = ${client.id})`,
    );
  }

  // Handle client disconnect
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const role = client.data.role;
    this.logger.log(
      `Client disconnected: ID = ${userId || 'Unknown'}, Role = ${role || 'Unknown'} (Socket ID = ${client.id})`,
    );
  }

  // Join chat room
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('chatRoomId') chatRoomId: string,
  ) {
    if (!chatRoomId) {
      this.logger.warn(`Join room failed: Missing chatRoomId`);
      return;
    }

    await client.join(chatRoomId);
    this.logger.log(
      `User ${client.data.userId} (Role: ${client.data.role}) joined room: ${chatRoomId}`,
    );

    // Confirm to client
    client.emit('joined_room', { chatRoomId });
  }

  //  Send message
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const senderId = client.data.userId;
    const senderRole = client.data.role;

    if (!senderId) {
      throw new WsException('Unauthorized access');
    }
    try {
      // Save message to database
      const message = await this.chatService.sendMessage(
        senderId,
        senderRole,
        dto,
      );

      this.logger.log(
        `New message from ${senderId} in room ${dto.chatRoomId}: ${dto.content}`,
      );

      this.server.to(dto.chatRoomId).emit('receive_message', message);
    } catch (err: any) {
      this.logger.error(`Send message error: ${err.message}`);
      client.emit('error', { message: err.message });
    }
  }

  // Typing indicator
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: TypingDto,
  ) {
    // Broadcast typing state to other clients in the room
    client.to(dto.chatRoomId).emit('user_typing', {
      chatRoomId: dto.chatRoomId,
      userId: client.data.userId,
      isTyping: dto.isTyping,
    });
  }

  // Mark messages as read
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody('chatRoomId') chatRoomId: string,
  ) {
    const userId = client.data.userId;
    const role = client.data.role;

    if (!chatRoomId) return;

    try {
      await this.chatService.markRoomAsRead(chatRoomId, userId, role);
      this.logger.log(`User ${userId} read messages in room ${chatRoomId}`);

      // Notify other client in the room to update read status in the UI
      client.to(chatRoomId).emit('message_read_update', {
        chatRoomId,
        readBy: userId,
      });
    } catch (err: any) {
      this.logger.error(`Mark read error: ${err.message}`);
    }
  }
}
