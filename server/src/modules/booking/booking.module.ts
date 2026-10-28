import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './models/schemas';
import { BookingController } from './controllers';
import { BookingService, PricingService } from './services';
import { BookingRepository } from './repositories';
import { CarModule } from '@modules/car/car.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    forwardRef(() => CarModule),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, PricingService],
  exports: [BookingService, BookingRepository, PricingService],
})
export class BookingModule {}
