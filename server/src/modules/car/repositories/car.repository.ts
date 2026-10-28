import { Injectable } from '@nestjs/common';
import { Car, CarDocument } from '../models/schemas/car.schema';
import { BaseRepository } from '@core/repositories';
import { Model, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BOOKING_STATUS } from '@modules/booking/constants';

@Injectable()
export class CarRepository extends BaseRepository<CarDocument> {
  constructor(
    @InjectModel(Car.name)
    private carModel: Model<CarDocument>,
  ) {
    super(carModel);
  }

  async findAvailableCars(
    startDate: Date,
    endDate: Date,
  ): Promise<CarDocument[]> {
    const pipeline: PipelineStage[] = [
      this.buildInitialCarMatchStage(),
      this.buildBookingLookupStage(startDate, endDate),
      ...this.buildStockCalculationStages(),
      this.buildFinalStockFilterStage(),
    ];

    return await this.carModel.aggregate<CarDocument>(pipeline).exec();
  }

  // Find available cars that status are set to true
  private buildInitialCarMatchStage(): PipelineStage.Match {
    return {
      $match: { isAvailable: true },
    };
  }

  // Lookup for active bookings
  private buildBookingLookupStage(
    startDate: Date,
    endDate: Date,
  ): PipelineStage.Lookup {
    return {
      $lookup: {
        from: 'bookings',
        let: { carId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$carId', '$$carId'] },
                  { $ne: ['$status', BOOKING_STATUS.CANCELLED] },
                  { $lt: ['$startDate', endDate] },
                  { $gt: ['$endDate', startDate] },
                ],
              },
            },
          },
        ],
        as: 'activeBookings',
      },
    };
  }

  private buildStockCalculationStages(): PipelineStage.AddFields[] {
    return [
      {
        $addFields: {
          bookedCount: { $size: '$activeBookings' },
        },
      },
      {
        $addFields: {
          dynamicAvailableStock: {
            $subtract: ['$availableStock', '$bookedCount'],
          },
        },
      },
    ];
  }

  private buildFinalStockFilterStage(): PipelineStage.Match {
    return {
      $match: {
        dynamicAvailableStock: { $gt: 0 },
      },
    };
  }

  async incrementAvailableStock(carId: string): Promise<CarDocument | null> {
    return await this.carModel
      .findOneAndUpdate(
        {
          _id: carId,
          $expr: { $lt: ['$availableStock', '$stock'] }, //  availableStock < stock
        },
        {
          $inc: { availableStock: 1 },
          $set: { isAvailable: true }, // availableStock > 0 => isAvailable = true
        },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async decrementAvailableStock(carId: string): Promise<CarDocument | null> {
    return await this.carModel
      .findOneAndUpdate(
        {
          _id: carId,
          availableStock: { $gt: 0 },
          isAvailable: true,
        },
        {
          $inc: { availableStock: -1 },
        },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
