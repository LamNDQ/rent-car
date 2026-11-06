import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({ required: false, trim: true })
  username!: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: false, unique: true, sparse: true })
  googleId?: string;

  @Prop({ required: false })
  needsProfileSetup?: boolean;

  @Prop({ required: true, enum: ['normal', 'vip', 'admin'], default: 'normal' })
  role!: string;

  @Prop({ type: [String], default: [] })
  refreshSessionIds!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
