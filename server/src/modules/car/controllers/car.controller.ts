import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import { CarService } from '../services';
import { CarDto, UpdateCarDto, SearchCarDto } from '../models/dto';
import { FindAvailableCarsDto } from '../models/dto/find-available-cars.dto';
import { Roles } from '../../../auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles/roles.guard';
import { UseGuards } from '@nestjs/common';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'cars');
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
]);

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
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          mkdirSync(UPLOAD_DIR, { recursive: true });
          callback(null, UPLOAD_DIR);
        },
        filename: (_req, file, callback) => {
          callback(
            null,
            `${Date.now()}-${randomUUID()}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (
          !file.mimetype.startsWith('image/') ||
          !ALLOWED_IMAGE_EXTENSIONS.has(extension)
        ) {
          callback(
            new BadRequestException(
              'Only JPG, PNG, WEBP, GIF or AVIF images are allowed',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    const baseUrl = (
      process.env.APP_BASE_URL || 'http://localhost:3000'
    ).replace(/\/+$/, '');

    return { url: `${baseUrl}/uploads/cars/${file.filename}` };
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
