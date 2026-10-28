import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@core/repositories';
import { ChatRoom, ChatRoomDocument } from '../models/schemas';

@Injectable()
export class RoomRepository extends BaseRepository<ChatRoomDocument> {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly roomModel: Model<ChatRoomDocument>,
  ) {
    super(roomModel);
  }

  // Should get vip first
  async getRoomsForAdmin(): Promise<ChatRoomDocument[]> {
    return await this.roomModel
      .find()
      .sort({ isVip: -1, updatedAt: -1 })
      .exec();
  }
}
