import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class TypingDto {
  @IsString()
  @IsNotEmpty({ message: 'ChatRoomId is required' })
  chatRoomId!: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'IsTyping is required' })
  isTyping!: boolean;
}
