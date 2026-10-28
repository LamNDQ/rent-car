import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../models/schemas';
import { BOOKING_STATUS } from '../constants';
import { BaseRepository } from '@core/repositories';

@Injectable()
export class BookingRepository extends BaseRepository<BookingDocument> {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {
    super(bookingModel);
  }

  async findById(id: string): Promise<BookingDocument | null> {
    return this.bookingModel.findById(id).populate('carId').exec();
  }

  async findByUserId(userId: string): Promise<BookingDocument[]> {
    const filterUserId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;
    return this.bookingModel
      .find({
        userId: filterUserId,
        status: { $ne: BOOKING_STATUS.CANCELLED },
      })
      .populate('carId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Admin: return every booking across all users, newest first. */
  async findAll(): Promise<BookingDocument[]> {
    return this.bookingModel
      .find()
      .populate('carId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateBooking(
    id: string,
    updates: Partial<Booking>,
  ): Promise<BookingDocument | null> {
    return this.bookingModel
      .findByIdAndUpdate(id, updates, { new: true })
      .populate('carId')
      .exec();
  }

  async hardDelete(id: string): Promise<BookingDocument | null> {
    return this.bookingModel.findByIdAndDelete(id).exec();
  }

  async countActiveBookingsForCar(
    carId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.bookingModel.countDocuments({
      carId: new Types.ObjectId(carId),
      status: { $ne: BOOKING_STATUS.CANCELLED },
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });
  }

  async countActiveBookingsForCarExcluding(
    carId: string,
    startDate: Date,
    endDate: Date,
    excludeId: string,
  ): Promise<number> {
    return this.bookingModel.countDocuments({
      _id: { $ne: new Types.ObjectId(excludeId) },
      carId: new Types.ObjectId(carId),
      status: { $ne: BOOKING_STATUS.CANCELLED },
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });
  }
}
