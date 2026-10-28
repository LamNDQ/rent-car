import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookingService } from '../services';
import {
  BookingResponseDto,
  CreateBookingDto,
  UpdateBookingDto,
  PreviewPriceDto,
  PreviewPriceResponseDto,
} from '../models/dto';
import { BookingGuard } from '../guard';
import { ResponseInterceptor } from '@core/interceptors';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(BookingGuard)
@UseInterceptors(ResponseInterceptor)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // ── Admin ─────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Admin: list all bookings across all users',
    description:
      'Pass x-user-role: admin header. Returns every booking, newest first.',
  })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  getAllBookings() {
    return this.bookingService.findAll();
  }

  // ── User ──────────────────────────────────────────────────────────────────

  @Post('preview-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preview price before creating a booking',
    description:
      'Returns full price breakdown (days, subtotal, discount, total). No booking is created.',
  })
  @ApiResponse({ status: 200, type: PreviewPriceResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid dates / voucher code' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  previewPrice(@Req() req: any, @Body() dto: PreviewPriceDto) {
    return this.bookingService.previewPrice(req.user.role, dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a booking (pass x-user-id + x-user-role headers)',
  })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Validation error / invalid voucher',
  })
  @ApiResponse({ status: 404, description: 'Car not found' })
  @ApiResponse({
    status: 409,
    description: 'Car already booked for these dates',
  })
  createBooking(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'List bookings for the current user' })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  getMyBookings(@Req() req: any) {
    return this.bookingService.findByUser(req.user.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update booking dates or voucher code' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Invalid dates / voucher / already cancelled',
  })
  @ApiResponse({
    status: 409,
    description: 'New dates conflict with another booking',
  })
  updateBooking(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingService.updateBooking(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a booking (anyone)' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  deleteBooking(@Param('id') id: string) {
    return this.bookingService.deleteBooking(id);
  }
}
