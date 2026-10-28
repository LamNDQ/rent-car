import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomRepository } from '../repositories/room.repository';
import { MessageRepository } from '../repositories/message.repository';
import { UserRepository } from '../../user/repositories';
import { SendMessageDto } from '../models/dto/send-message.dto';
import { MessageStatus, SenderRole } from '../models/schemas/chat.enum';

@Injectable()
export class ChatService {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly messageRepo: MessageRepository,
    private readonly userRepo: UserRepository,
  ) {}

  // Send message and update room chat
  async sendMessage(
    senderId: string,
    senderRole: SenderRole,
    dto: SendMessageDto,
  ) {
    // Check valid role
    let role = SenderRole.NORMAL;
    if (senderRole === SenderRole.ADMIN) role = SenderRole.ADMIN;
    else if (senderRole === SenderRole.VIP) role = SenderRole.VIP;

    // Find or create room chat if not exists
    let room = await this.roomRepo.findOneById(dto.chatRoomId);
    if (!room) {
      const user = await this.userRepo.findOneById(dto.chatRoomId);
      if (!user) {
        throw new NotFoundException('User room not found');
      }
      room = await this.roomRepo.create({
        _id: dto.chatRoomId,
        username: user.username || user.email,
        isVip: user.role === 'vip',
        lastMessage: dto.content,
        unreadCount: 0,
      });
    }

    const message = await this.messageRepo.create({
      chatRoomId: dto.chatRoomId,
      senderId,
      senderRole: role,
      content: dto.content,
      status: MessageStatus.SENT,
    });

    // Update room chat (last message)
    const updateData: Record<string, any> = {
      lastMessage: dto.content,
    };

    // If sender is not admin, increase unreadCount to let Admin know
    if (role !== SenderRole.ADMIN) {
      updateData.unreadCount = room.unreadCount + 1;
    }

    await this.roomRepo.update(dto.chatRoomId, updateData);

    return message;
  }

  async markRoomAsRead(
    chatRoomId: string,
    readerId: string,
    readerRole: string,
  ) {
    await this.messageRepo.markAsRead(chatRoomId, readerId);
    if (readerRole === 'admin') {
      await this.roomRepo.update(chatRoomId, { unreadCount: 0 });
    }
  }

  async getRoomsForAdmin() {
    return await this.roomRepo.getRoomsForAdmin();
  }

  async getMessagesByRoom(roomId: string) {
    return await this.messageRepo.getMessagesByRoom(roomId);
  }
}
