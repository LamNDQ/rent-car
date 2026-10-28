import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatRoomDocument = HydratedDocument<ChatRoom, { _id: any }>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class ChatRoom {
  // userID are id of the room, one room has one sender and one receiver
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true, trim: true })
  username!: string;

  @Prop({ type: Boolean, default: false })
  isVip!: boolean;

  @Prop({ type: String, default: '' })
  lastMessage!: string;

  @Prop({ type: Number, default: 0 })
  unreadCount!: number;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

// Sort to show vip chat first, then sort by the most recent chat
ChatRoomSchema.index({ isVip: -1, updatedAt: -1 });
