import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAvailableCarsDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate!: Date;
}
