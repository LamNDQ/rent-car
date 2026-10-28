import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CarRepository } from '../repositories';
import { CarDocument } from '../models/schemas';
import { QueryFilter, UpdateQuery } from 'mongoose';
import { CarDto, UpdateCarDto, SearchCarDto } from '../models/dto';

@Injectable()
export class CarService {
  constructor(private carRepository: CarRepository) {}

  public async findAll(): Promise<CarDocument[]> {
    return await this.carRepository.findAll();
  }

  public async findAvailableCars(
    startDate: Date,
    endDate: Date,
  ): Promise<CarDocument[]> {
    if (startDate.getTime() >= endDate.getTime()) {
      throw new BadRequestException(
        'Start date must be earlier than end date.',
      );
    }
    try {
      return await this.carRepository.findAvailableCars(startDate, endDate);
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        `Failed to retrieve available cars, error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  public async findOneById(id: string): Promise<CarDocument | null> {
    const car = await this.carRepository.findOneById(id);
    if (!car) {
      throw new NotFoundException(`Car With ${id} not found`);
    }
    return car;
  }

  public async findOne(
    filter: QueryFilter<SearchCarDto>,
  ): Promise<CarDocument | null> {
    const car = await this.carRepository.findOne(filter);
    if (!car) {
      throw new NotFoundException(
        `Car with filter ${JSON.stringify(filter)} not found`,
      );
    }
    return car;
  }

  public async create(data: CarDto): Promise<CarDocument> {
    const car = await this.carRepository.create(data);
    if (!car) {
      throw new InternalServerErrorException(
        'Failed to create car record in database',
      );
    }
    return car;
  }

  public async update(
    id: string,
    updateData: UpdateQuery<UpdateCarDto>,
  ): Promise<CarDocument> {
    const updatedCar = await this.carRepository.update(id, updateData);
    if (!updatedCar) {
      throw new NotFoundException(`Car With ${id} not found to update`);
    }
    return updatedCar;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.carRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Car with ID ${id} not found to delete`);
    }
    return result;
  }

  public async incrementAvailableStock(
    carId: string,
  ): Promise<CarDocument | null> {
    const updateStock = await this.carRepository.incrementAvailableStock(carId);
    if (!updateStock) {
      const existingCar = await this.carRepository.findOneById(carId);
      if (!existingCar) {
        throw new NotFoundException(`Car with ID ${carId} not found.`);
      }
      throw new BadRequestException(
        `Cannot increment available stock. Current available stock (${existingCar.availableStock}) has already reached its total stock limit (${existingCar.stock}).`,
      );
    }
    return updateStock;
  }

  public async decrementAvailableStock(carId: string): Promise<CarDocument> {
    const updatedCar = await this.carRepository.decrementAvailableStock(carId);
    if (!updatedCar) {
      const existingCar = await this.carRepository.findOneById(carId);
      if (!existingCar) {
        throw new NotFoundException(`Car with ID ${carId} not found.`);
      }
      throw new BadRequestException(
        `Car with ID ${carId} cannot be rented. It is either out of stock (Available: ${existingCar.availableStock}) or currently unavailable.`,
      );
    }
    if (updatedCar.availableStock === 0) {
      updatedCar.isAvailable = false;
      await updatedCar.save();
    }
    return updatedCar;
  }
}
