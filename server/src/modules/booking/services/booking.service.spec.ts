import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { PricingService } from './pricing.service';
import { BOOKING_STATUS } from '../constants';

// ── Minimal mock factories ─────────────────────────────────────────────────────

const mockCar = (overrides = {}) => ({
  _id: { toString: () => 'car-id-1' },
  brand: 'Toyota',
  carModel: 'Camry',
  basePrice: 100,
  availableStock: 2,
  imgUrl: ['https://example.com/camry.jpg'],
  ...overrides,
});

const mockBooking = (overrides = {}) => ({
  _id: { toString: () => 'booking-id-1' },
  userId: { toString: () => 'user-id-1' },
  carId: {
    _id: { toString: () => 'car-id-1' },
    basePrice: 100,
    availableStock: 2,
  },
  startDate: new Date('2024-07-01'),
  endDate: new Date('2024-07-10'),
  dailyPrice: 100,
  subtotal: 900,
  discountApplied: 0,
  discountAmount: 0,
  totalPrice: 900,
  voucherCode: undefined,
  status: BOOKING_STATUS.CONFIRMED,
  userRole: 'normal',
  carBrand: 'Toyota',
  carModel: 'Camry',
  carImg: 'https://example.com/camry.jpg',
  createdAt: new Date(),
  ...overrides,
});

const makeBookingRepo = (overrides = {}) => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByUserId: jest.fn().mockResolvedValue([]),
  create: jest.fn(),
  updateBooking: jest.fn(),
  hardDelete: jest.fn(),
  countActiveBookingsForCar: jest.fn().mockResolvedValue(0),
  countActiveBookingsForCarExcluding: jest.fn().mockResolvedValue(0),
  ...overrides,
});

const makeCarRepo = (overrides = {}) => ({
  findOneById: jest.fn().mockResolvedValue(null),
  decrementAvailableStock: jest.fn(),
  incrementAvailableStock: jest.fn(),
  ...overrides,
});

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepo: ReturnType<typeof makeBookingRepo>;
  let carRepo: ReturnType<typeof makeCarRepo>;
  let pricingService: PricingService;

  beforeEach(() => {
    bookingRepo = makeBookingRepo();
    carRepo = makeCarRepo();
    pricingService = new PricingService();
    service = new BookingService(
      bookingRepo as any,
      carRepo as any,
      pricingService,
    );
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns mapped DTOs', async () => {
      const b = mockBooking();
      bookingRepo.findAll.mockResolvedValue([b]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('booking-id-1');
      expect(result[0].carBrand).toBe('Toyota');
    });
  });

  // ── previewPrice ─────────────────────────────────────────────────────────────

  describe('previewPrice', () => {
    const dto = {
      carId: 'car-id-1',
      startDate: '2024-07-01',
      endDate: '2024-07-10',
    };

    it('throws NotFoundException when car not found', async () => {
      carRepo.findOneById.mockResolvedValue(null);
      await expect(service.previewPrice('normal', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns price breakdown for valid car', async () => {
      carRepo.findOneById.mockResolvedValue(mockCar());
      const result = await service.previewPrice('normal', dto);
      expect(result.days).toBe(9);
      expect(result.dailyPrice).toBe(100);
      expect(result.subtotal).toBe(900);
      expect(result.totalPrice).toBe(900);
    });

    it('throws BadRequestException for invalid voucher', async () => {
      carRepo.findOneById.mockResolvedValue(mockCar());
      await expect(
        service.previewPrice('normal', { ...dto, voucherCode: 'INVALID' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── createBooking ─────────────────────────────────────────────────────────────

  describe('createBooking', () => {
    const user = { id: 'user-id-1', role: 'normal' };
    const dto = {
      carId: 'car-id-1',
      startDate: '2024-07-01',
      endDate: '2024-07-10',
    };

    it('throws NotFoundException when car not found', async () => {
      carRepo.findOneById.mockResolvedValue(null);
      await expect(service.createBooking(user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when car is fully booked for the dates', async () => {
      carRepo.findOneById.mockResolvedValue(mockCar({ availableStock: 1 }));
      bookingRepo.countActiveBookingsForCar.mockResolvedValue(1);
      await expect(service.createBooking(user, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates booking with car snapshot and returns DTO', async () => {
      const car = mockCar();
      carRepo.findOneById.mockResolvedValue(car);
      bookingRepo.countActiveBookingsForCar.mockResolvedValue(0);
      const created = mockBooking();
      bookingRepo.create.mockResolvedValue(created);

      const result = await service.createBooking(user, dto);

      expect(result.id).toBe('booking-id-1');
      expect(bookingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id-1',
          carId: 'car-id-1',
          userRole: 'normal',
          carBrand: 'Toyota',
          carModel: 'Camry',
          carImg: 'https://example.com/camry.jpg',
          status: BOOKING_STATUS.CONFIRMED,
        }),
      );
      expect(carRepo.decrementAvailableStock).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for invalid voucher WITHOUT any stock side effect', async () => {
      carRepo.findOneById.mockResolvedValue(mockCar());
      bookingRepo.countActiveBookingsForCar.mockResolvedValue(0);
      await expect(
        service.createBooking(user, { ...dto, voucherCode: 'BADCODE' }),
      ).rejects.toThrow(BadRequestException);
      expect(carRepo.decrementAvailableStock).not.toHaveBeenCalled();
      expect(bookingRepo.create).not.toHaveBeenCalled();
    });

    it('applies only the voucher discount for a normal user', async () => {
      const car = mockCar();
      carRepo.findOneById.mockResolvedValue(car);
      bookingRepo.countActiveBookingsForCar.mockResolvedValue(0);
      const created = mockBooking({
        subtotal: 900,
        discountApplied: 20,
        discountAmount: 180,
        totalPrice: 720,
        voucherCode: 'SUMMER20',
      });
      bookingRepo.create.mockResolvedValue(created);

      const result = await service.createBooking(user, {
        ...dto,
        voucherCode: 'SUMMER20',
      });

      expect(bookingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ discountApplied: 20, totalPrice: 720 }),
      );
      expect(result.totalPrice).toBe(720);
    });
  });

  // ── deleteBooking ─────────────────────────────────────────────────────────────

  describe('deleteBooking', () => {
    it('throws NotFoundException when booking not found', async () => {
      bookingRepo.findById.mockResolvedValue(null);
      await expect(service.deleteBooking('booking-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes booking without touching car stock', async () => {
      const b = mockBooking();
      bookingRepo.findById.mockResolvedValue(b);
      bookingRepo.hardDelete.mockResolvedValue(b);

      const result = await service.deleteBooking('booking-id-1');

      expect(result.message).toBe('Booking deleted successfully');
      expect(bookingRepo.hardDelete).toHaveBeenCalledWith('booking-id-1');
      expect(carRepo.incrementAvailableStock).not.toHaveBeenCalled();
    });
  });

  // ── updateBooking ─────────────────────────────────────────────────────────────

  describe('updateBooking', () => {
    it('throws NotFoundException when booking not found', async () => {
      bookingRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateBooking('booking-id-1', 'user-id-1', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when user does not own booking', async () => {
      bookingRepo.findById.mockResolvedValue(mockBooking());
      await expect(
        service.updateBooking('booking-id-1', 'other-user', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when booking is cancelled', async () => {
      bookingRepo.findById.mockResolvedValue(
        mockBooking({ status: BOOKING_STATUS.CANCELLED }),
      );
      await expect(
        service.updateBooking('booking-id-1', 'user-id-1', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates booking and returns DTO', async () => {
      const b = mockBooking();
      bookingRepo.findById.mockResolvedValue(b);
      const updated = mockBooking({ endDate: new Date('2024-07-15') });
      bookingRepo.updateBooking.mockResolvedValue(updated);

      const result = await service.updateBooking('booking-id-1', 'user-id-1', {
        endDate: '2024-07-15',
      });
      expect(result.id).toBe('booking-id-1');
      expect(bookingRepo.updateBooking).toHaveBeenCalledTimes(1);
    });

    it('keeps only the voucher discount (20%) for a normal user on update — no VIP inflation', async () => {
      const b = mockBooking({
        userRole: 'normal',
        voucherCode: 'SUMMER20',
        discountApplied: 20,
        discountAmount: 180,
        subtotal: 900,
        totalPrice: 720,
      });
      bookingRepo.findById.mockResolvedValue(b);
      const updated = mockBooking({
        userRole: 'normal',
        voucherCode: 'SUMMER20',
        discountApplied: 20,
        discountAmount: 180,
        subtotal: 900,
        totalPrice: 720,
      });
      bookingRepo.updateBooking.mockResolvedValue(updated);

      const result = await service.updateBooking('booking-id-1', 'user-id-1', {
        endDate: '2024-07-15',
      });

      expect(bookingRepo.updateBooking).toHaveBeenCalledWith(
        'booking-id-1',
        expect.objectContaining({ discountApplied: 20 }),
      );
      expect(result.discountApplied).toBe(20);
    });

    it('throws ConflictException when new dates overlap the car limit', async () => {
      const b = mockBooking();
      bookingRepo.findById.mockResolvedValue(b);
      bookingRepo.countActiveBookingsForCarExcluding.mockResolvedValue(2);

      await expect(
        service.updateBooking('booking-id-1', 'user-id-1', {
          startDate: '2024-08-01',
          endDate: '2024-08-05',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
