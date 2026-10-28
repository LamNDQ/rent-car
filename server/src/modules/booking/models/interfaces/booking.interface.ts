import { Document } from 'mongoose';
import { BookingStatus } from '../../constants';

export interface IBooking extends Document {
  readonly userId: string;
  readonly carId: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly dailyPrice: number;
  readonly subtotal: number;
  readonly discountApplied: number;
  readonly discountAmount: number;
  readonly totalPrice: number;
  readonly voucherCode?: string;
  readonly status: BookingStatus;
  readonly userRole: string;
  readonly carBrand?: string;
  readonly carModel?: string;
  readonly carImg?: string;
}
