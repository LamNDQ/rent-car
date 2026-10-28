import { Module } from '@nestjs/common';
import { Car, CarSchema } from './models/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { CarController } from './controllers';
import { CarService } from './services';
import { CarRepository } from './repositories';
import { Booking, BookingSchema } from '@modules/booking/models/schemas';
import { UserModule } from '@modules/user';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Car.name, schema: CarSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    UserModule,
  ],
  controllers: [CarController],
  providers: [CarService, CarRepository],
  exports: [CarService, CarRepository],
})
export class CarModule {}
