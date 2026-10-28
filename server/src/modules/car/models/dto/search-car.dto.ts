import { PartialType } from '@nestjs/mapped-types';
import { CarDto } from './car.dto';

export class SearchCarDto extends PartialType(CarDto) {}
