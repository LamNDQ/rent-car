import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

// ── Custom validator: endDate must be after startDate ─────────────────────────
@ValidatorConstraint({ name: 'IsAfterConstraint', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments): boolean {
    const dto = args.object as { startDate?: string };
    if (!dto.startDate || !endDate) return true;
    return new Date(endDate) > new Date(dto.startDate);
  }

  defaultMessage(): string {
    return 'endDate must be after startDate';
  }
}

export class CreateBookingDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d', description: 'Car ID' })
  @IsMongoId()
  @IsNotEmpty()
  carId!: string;

  @ApiProperty({
    example: '2024-07-01',
    description: 'Booking start date (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    example: '2024-07-10',
    description: 'Booking end date (ISO 8601)',
  })
  @IsDateString()
  @Validate(IsAfterConstraint)
  endDate!: string;

  @ApiPropertyOptional({
    example: 'SUMMER20',
    description: 'Optional voucher code',
  })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({
    example: '2024-08-01',
    description: 'New start date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-08-10',
    description: 'New end date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  @Validate(IsAfterConstraint)
  endDate?: string;

  @ApiPropertyOptional({
    example: 'FLASH15',
    description: 'New or updated voucher code',
  })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}

// ── Preview price ─────────────────────────────────────────────────────────────
export class PreviewPriceDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d', description: 'Car ID' })
  @IsMongoId()
  @IsNotEmpty()
  carId!: string;

  @ApiProperty({
    example: '2024-07-01',
    description: 'Booking start date (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    example: '2024-07-10',
    description: 'Booking end date (ISO 8601)',
  })
  @IsDateString()
  @Validate(IsAfterConstraint)
  endDate!: string;

  @ApiPropertyOptional({
    example: 'SUMMER20',
    description: 'Optional voucher code',
  })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}

export class PreviewPriceResponseDto {
  @ApiProperty({ example: 9, description: 'Number of rental days' })
  days!: number;

  @ApiProperty({ example: 100, description: 'Daily base price of the car' })
  dailyPrice!: number;

  @ApiProperty({
    example: 900,
    description: 'basePrice × days before discount',
  })
  subtotal!: number;

  @ApiProperty({ example: 30, description: 'Total discount applied (%)' })
  discountApplied!: number;

  @ApiProperty({ example: 270, description: 'Amount deducted from subtotal' })
  discountAmount!: number;

  @ApiProperty({ example: 630, description: 'Final price after discount' })
  totalPrice!: number;
}

export class BookingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  carId!: string;

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  endDate!: string;

  @ApiProperty({ description: 'Daily base price of the car' })
  dailyPrice!: number;

  @ApiProperty({ description: 'basePrice × days before discount' })
  subtotal!: number;

  @ApiProperty({ description: 'Total discount applied (%)', example: 30 })
  discountApplied!: number;

  @ApiProperty({ description: 'Amount deducted from subtotal', example: 150 })
  discountAmount!: number;

  @ApiProperty({
    description: 'Final price after discount (subtotal - discountAmount)',
  })
  totalPrice!: number;

  @ApiPropertyOptional()
  voucherCode?: string;

  @ApiProperty({ example: 'confirmed' })
  status!: string;

  @ApiProperty({ example: 'normal' })
  userRole!: string;

  @ApiPropertyOptional({ description: 'Car brand snapshot at booking time' })
  carBrand?: string;

  @ApiPropertyOptional({ description: 'Car model snapshot at booking time' })
  carModel?: string;

  @ApiPropertyOptional({ description: 'Car image snapshot at booking time' })
  carImg?: string;

  @ApiProperty()
  createdAt!: string;
}
