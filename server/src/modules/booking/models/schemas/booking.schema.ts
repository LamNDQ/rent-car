import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { BOOKING_STATUS } from '../../constants';
import type { BookingStatus } from '../../constants';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Car',
    required: true,
    index: true,
  })
  carId!: Types.ObjectId;

  @Prop({ type: String, default: 'normal' })
  userRole!: string;

  @Prop({ type: String, required: false })
  carBrand?: string;

  @Prop({ type: String, required: false })
  carModel?: string;

  @Prop({ type: String, required: false })
  carImg?: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true })
  dailyPrice!: number;

  @Prop({ required: true })
  subtotal!: number; // dailyPrice × days (before discount)

  @Prop({ type: Number, default: 0 })
  discountApplied!: number; // percentage, e.g. 30 = 30%

  @Prop({ type: Number, default: 0 })
  discountAmount!: number; // actual amount deducted

  @Prop({ required: true })
  totalPrice!: number; // subtotal - discountAmount

  @Prop({
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.CONFIRMED,
  })
  status!: BookingStatus;

  @Prop({ type: String, required: false })
  voucherCode?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index(
  { carId: 1, startDate: 1, endDate: 1 },
  { name: 'idx_booking_car_dates' },
);
