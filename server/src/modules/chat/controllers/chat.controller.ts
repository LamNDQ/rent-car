import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from '../services/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async getRooms() {
    return await this.chatService.getRoomsForAdmin();
  }

  @Get('rooms/:roomId/messages')
  async getMessages(@Param('roomId') roomId: string) {
    return await this.chatService.getMessagesByRoom(roomId);
  }
}
