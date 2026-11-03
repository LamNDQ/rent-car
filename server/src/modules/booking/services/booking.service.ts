import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { CarRepository } from '@modules/car/repositories/car.repository';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingResponseDto,
  PreviewPriceDto,
  PreviewPriceResponseDto,
} from '../models/dto';
import { BOOKING_ERRORS, BOOKING_STATUS } from '../constants';
import { PricingService } from './pricing.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly carRepository: CarRepository,
    private readonly pricingService: PricingService,
  ) {}

  // ── Preview price (no DB write) ──────────────────────────────────────────

  async previewPrice(
    userRole: string,
    dto: PreviewPriceDto,
  ): Promise<PreviewPriceResponseDto> {
    const car = await this.carRepository.findOneById(dto.carId);
    if (!car) throw new NotFoundException(BOOKING_ERRORS.CAR_NOT_FOUND);

    const { breakdown, invalidVoucher } =
      this.pricingService.calculateBreakdown(
        car.basePrice,
        new Date(dto.startDate),
        new Date(dto.endDate),
        userRole,
        dto.voucherCode,
      );

    if (invalidVoucher)
      throw new BadRequestException(BOOKING_ERRORS.VOUCHER_INVALID);

    return breakdown;
  }

  // ── Admin: get all bookings ───────────────────────────────────────────────

  async findAll(): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findAll();
    return bookings.map((b) => this.toDto(b));
  }

  // ── Create booking ────────────────────────────────────────────────────────

  async createBooking(
    user: { id: string; role: string },
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    // 1. Car must exist
    const car = await this.carRepository.findOneById(dto.carId);
    if (!car) throw new NotFoundException(BOOKING_ERRORS.CAR_NOT_FOUND);

    // 2. Pricing & voucher validation BEFORE any side effect
    const { breakdown, invalidVoucher } =
      this.pricingService.calculateBreakdown(
        car.basePrice,
        start,
        end,
        user.role,
        dto.voucherCode,
      );
    if (invalidVoucher)
      throw new BadRequestException(BOOKING_ERRORS.VOUCHER_INVALID);

    // 3. Count overlapping active bookings — must be less than availableStock
    const activeCount = await this.bookingRepository.countActiveBookingsForCar(
      dto.carId,
      start,
      end,
    );
    if (activeCount >= car.availableStock) {
      throw new ConflictException(BOOKING_ERRORS.CAR_UNAVAILABLE);
    }

    // 4. Persist
    const booking = await this.bookingRepository.create({
      userId: user.id as any,
      carId: dto.carId as any,
      userRole: user.role,
      carBrand: car.brand,
      carModel: car.carModel,
      carImg: car.imgUrl?.[0],
      startDate: start,
      endDate: end,
      dailyPrice: breakdown.dailyPrice,
      subtotal: breakdown.subtotal,
      discountApplied: breakdown.discountApplied,
      discountAmount: breakdown.discountAmount,
      totalPrice: breakdown.totalPrice,
      voucherCode: dto.voucherCode,
      status: BOOKING_STATUS.CONFIRMED,
    });

    return this.toDto(booking);
  }

  // ── Get bookings for current user ─────────────────────────────────────────

  async findByUser(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findByUserId(userId);
    return bookings.map((b) => this.toDto(b));
  }

  // ── Update booking dates / voucher ────────────────────────────────────────

  async updateBooking(
    id: string,
    userId: string,
    dto: UpdateBookingDto,
    userRole?: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new NotFoundException(BOOKING_ERRORS.NOT_FOUND);
    if (userRole !== 'admin' && booking.userId.toString() !== userId)
      throw new BadRequestException(BOOKING_ERRORS.FORBIDDEN);
    if (booking.status === BOOKING_STATUS.CANCELLED)
      throw new BadRequestException('Cannot update a cancelled booking');

    // carId is a populated CarDocument after findById
    const car = booking.carId as any;
    if (!car || !car._id)
      throw new NotFoundException(BOOKING_ERRORS.CAR_NOT_FOUND);
    const carId = car._id.toString();

    const start = dto.startDate ? new Date(dto.startDate) : booking.startDate;
    const end = dto.endDate ? new Date(dto.endDate) : booking.endDate;

    if (end <= start)
      throw new BadRequestException('endDate must be after startDate');

    if (dto.startDate || dto.endDate) {
      const activeCount =
        await this.bookingRepository.countActiveBookingsForCarExcluding(
          carId,
          start,
          end,
          id,
        );
      if (activeCount >= car.availableStock) {
        throw new ConflictException(BOOKING_ERRORS.CAR_UNAVAILABLE);
      }
    }

    const voucherCode =
      dto.voucherCode !== undefined ? dto.voucherCode : booking.voucherCode;

    // Reuse the role captured at booking creation so VIP discount stays stable
    const bookingUserRole = booking.userRole || 'normal';

    const { breakdown, invalidVoucher } =
      this.pricingService.calculateBreakdown(
        car.basePrice,
        start,
        end,
        bookingUserRole,
        voucherCode ?? undefined,
      );
    if (invalidVoucher)
      throw new BadRequestException(BOOKING_ERRORS.VOUCHER_INVALID);

    const updated = await this.bookingRepository.updateBooking(id, {
      startDate: start,
      endDate: end,
      voucherCode: voucherCode ?? undefined,
      dailyPrice: breakdown.dailyPrice,
      subtotal: breakdown.subtotal,
      discountApplied: breakdown.discountApplied,
      discountAmount: breakdown.discountAmount,
      totalPrice: breakdown.totalPrice,
    });

    return this.toDto(updated!);
  }

  // ── Delete a booking (anyone can delete) ─────────────────────────────────

  async deleteBooking(
    id: string,
    userId?: string,
    userRole?: string,
  ): Promise<{ message: string }> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new NotFoundException(BOOKING_ERRORS.NOT_FOUND);

    if (
      userRole !== 'admin' &&
      userId &&
      booking.userId.toString() !== userId
    ) {
      throw new BadRequestException(BOOKING_ERRORS.FORBIDDEN);
    }

    await this.bookingRepository.hardDelete(id);

    return { message: 'Booking deleted successfully' };
  }

  // ── Mapper ────────────────────────────────────────────────────────────────

  private toDto(booking: any): BookingResponseDto {
    return {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      carId: (booking.carId?._id ?? booking.carId)?.toString() ?? '',
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      dailyPrice: booking.dailyPrice,
      subtotal: booking.subtotal,
      discountApplied: booking.discountApplied,
      discountAmount: booking.discountAmount,
      totalPrice: booking.totalPrice,
      voucherCode: booking.voucherCode,
      status: booking.status,
      userRole: booking.userRole,
      carBrand: booking.carBrand,
      carModel: booking.carModel,
      carImg: booking.carImg,
      createdAt: booking.createdAt?.toISOString(),
    };
  }
}
