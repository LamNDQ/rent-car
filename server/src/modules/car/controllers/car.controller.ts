import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CarService } from '../services';
import { CarDto, UpdateCarDto, SearchCarDto } from '../models/dto';
import { FindAvailableCarsDto } from '../models/dto/find-available-cars.dto';
import { Roles } from '../../../auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles/roles.guard';
import { UseGuards } from '@nestjs/common';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  async findAll() {
    return await this.carService.findAll();
  }

  @Get('search')
  async findOne(@Query() filter: SearchCarDto) {
    return await this.carService.findOne(filter);
  }

  @Get('available')
  async findAvailableCars(@Query() query: FindAvailableCarsDto) {
    return await this.carService.findAvailableCars(
      query.startDate,
      query.endDate,
    );
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return await this.carService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() data: CarDto) {
    return await this.carService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateCarDto) {
    return await this.carService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return await this.carService.delete(id);
  }
}
