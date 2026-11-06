import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  IsIn,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'vip', 'admin'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  needsProfileSetup?: boolean;
}

export class UserLoginDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
