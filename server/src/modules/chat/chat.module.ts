import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ChatRoom,
  ChatRoomSchema,
  Message,
  MessageSchema,
} from './models/schemas';
import { RoomRepository, MessageRepository } from './repositories';
import { ChatService } from './services';
import { ChatController } from './controllers';
import { ChatGateway } from './gateways';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, RoomRepository, MessageRepository, ChatGateway],
  exports: [ChatService, RoomRepository, MessageRepository],
})
export class ChatModule {}
