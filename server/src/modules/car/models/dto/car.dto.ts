import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CarDto {
  @IsNotEmpty()
  @IsString()
  brand!: string;

  @IsNotEmpty()
  @IsString()
  carModel!: string;

  @IsNotEmpty()
  @IsInt()
  year!: number;

  @IsNotEmpty()
  @IsString()
  color!: string;

  @IsNotEmpty()
  @IsInt()
  seat!: number;

  @IsNotEmpty()
  @IsNumber()
  basePrice!: number;

  @IsNotEmpty()
  @IsNumber()
  stock!: number;

  @IsNotEmpty()
  @IsNumber()
  availableStock!: number;

  @IsBoolean()
  isAvailable!: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imgUrl?: string[];
}
