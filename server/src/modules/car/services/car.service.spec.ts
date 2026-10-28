import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from './car.service';
import { CarRepository } from '../repositories/car.repository';
import { FindAvailableCarsDto } from '../models/dto/find-available-cars.dto';

describe('CarService', () => {
  let carService: CarService;

  const mockCarRepository = {
    findAll: jest.fn(),
    findAvailableCars: jest.fn(),
    findOneById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    incrementAvailableStock: jest.fn(),
    decrementAvailableStock: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: CarRepository,
          useValue: mockCarRepository,
        },
      ],
    }).compile();

    carService = moduleRef.get<CarService>(CarService);
  });

  describe('findAvailableCars', () => {
    it('should return an array of available cars successfully', async () => {
      const mockCarsResult = [
        {
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
        },
      ];

      mockCarRepository.findAvailableCars.mockResolvedValue(mockCarsResult);

      const mockQueryDto: FindAvailableCarsDto = {
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-06-10'),
      };

      const result = await carService.findAvailableCars(
        mockQueryDto.startDate,
        mockQueryDto.endDate,
      );
      expect(result).toEqual(mockCarsResult);
      expect(mockCarRepository.findAvailableCars).toHaveBeenCalledWith(
        mockQueryDto.startDate,
        mockQueryDto.endDate,
      );
    });

    it('should throw BadRequestException when start date is not earlier than end date', async () => {
      const mockQueryDto: FindAvailableCarsDto = {
        startDate: new Date('2026-06-10'),
        endDate: new Date('2026-06-10'),
      };

      await expect(
        carService.findAvailableCars(
          mockQueryDto.startDate,
          mockQueryDto.endDate,
        ),
      ).rejects.toThrow('Start date must be earlier than end date.');
      expect(mockCarRepository.findAvailableCars).not.toHaveBeenCalled();
    });
  });
});
