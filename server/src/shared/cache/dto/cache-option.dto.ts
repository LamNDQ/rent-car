import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SetCacheDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: unknown;

  @IsNumber()
  @IsOptional()
  ttlInSeconds?: number;
}
