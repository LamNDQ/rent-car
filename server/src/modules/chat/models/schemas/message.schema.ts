import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MessageStatus, SenderRole } from './chat.enum';

export type MessageDocument = HydratedDocument<Message>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Message {
  @Prop({ type: String, required: true })
  chatRoomId!: string;

  @Prop({ type: String, required: true })
  senderId!: string;

  @Prop({ type: String, enum: SenderRole, required: true })
  senderRole!: SenderRole;

  @Prop({ type: String, required: true })
  content!: string;

  @Prop({ type: String, enum: MessageStatus, default: MessageStatus.SENT })
  status!: MessageStatus;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// index to load messages by room in ascending order of time (old to new)
MessageSchema.index({ chatRoomId: 1, createdAt: 1 });
