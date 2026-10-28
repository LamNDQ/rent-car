import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@core/repositories';
import { Message, MessageDocument, MessageStatus } from '../models/schemas';

@Injectable()
export class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }

  // Get messages sorted by time ascending (old to new)
  async getMessagesByRoom(
    chatRoomId: string,
    limit = 50,
  ): Promise<MessageDocument[]> {
    return await this.messageModel
      .find({ chatRoomId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  // Update status
  async markAsRead(chatRoomId: string, readerId: string): Promise<void> {
    await this.messageModel
      .updateMany(
        {
          chatRoomId,
          senderId: { $ne: readerId },
          status: MessageStatus.SENT,
        },
        { $set: { status: MessageStatus.READ } },
      )
      .exec();
  }
}
