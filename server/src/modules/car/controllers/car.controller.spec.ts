import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserService } from '@modules/user/services/user.service';
import { CarController } from './car.controller';
import { CarService } from '../services';
import { CarDocument } from '../models/schemas';
import { FindAvailableCarsDto } from '../models/dto/find-available-cars.dto';

describe('CarController', () => {
  let carController: CarController;

  const mockCarService = {
    findAll: jest.fn(),
    findAvailableCars: jest.fn(),
    findOne: jest.fn(),
    findOneById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CarController],
      providers: [
        {
          provide: CarService,
          useValue: mockCarService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn(), sign: jest.fn() },
        },
        {
          provide: Reflector,
          useValue: new Reflector(),
        },
        {
          provide: UserService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    carController = moduleRef.get<CarController>(CarController);
  });

  const mockCarRaw = {
    _id: 'mock-mongoose-id-123',
    brand: 'Toyota',
    carModel: 'Camry',
    year: 2024,
    color: 'Black',
    seat: 5,
    basePrice: 30000,
    stock: 10,
    availableStock: 10,
    isAvailable: true,
    imgUrl: [],
  };
  const mockCarDocuments = [mockCarRaw] as unknown as CarDocument[];

  describe('findAll', () => {
    it('should return an array of car documents', async () => {
      mockCarService.findAll.mockResolvedValue(mockCarDocuments);

      const result = await carController.findAll();

      expect(result).toBe(mockCarDocuments);
      expect(result[0].brand).toBe('Toyota');
      expect(mockCarService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAvailableCars', () => {
    it('should return an array of car documents based on query date', async () => {
      const mockQueryDto: FindAvailableCarsDto = {
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-06-10'),
      };
      mockCarService.findAvailableCars.mockResolvedValue(mockCarDocuments);

      const result = await carController.findAvailableCars(mockQueryDto);

      expect(result).toBe(mockCarDocuments);
      expect(result[0].brand).toBe('Toyota');
      expect(mockCarService.findAvailableCars).toHaveBeenCalledTimes(1);
      expect(mockCarService.findAvailableCars).toHaveBeenCalledWith(
        mockQueryDto.startDate,
        mockQueryDto.endDate,
      );
    });
  });
});
