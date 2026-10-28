import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'chatRoomId is required' })
  chatRoomId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content!: string;
}
