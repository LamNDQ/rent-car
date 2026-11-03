import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CarModule } from '@modules/car/car.module';
import { BookingModule } from '@modules/booking/booking.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoggerMiddleware } from '@core/middlewares/logger.middleware';
import { CarController } from '@modules/car/controllers';
import { UserModule } from '@modules/user/user.module';
import { SsoModule } from './modules/sso/sso.module';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { RolesGuard } from './auth/roles/roles.guard';
import { Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URL') ||
          'mongodb://localhost:27017/car_rental',
      }),
      inject: [ConfigService],
    }),
    CarModule,
    BookingModule,
    UserModule,
    SsoModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'THIS_IS_A_FALLBACK_SECRET_CHANGE_ME_IN_PRODUCTION',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    RolesGuard,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CarController);
  }
}
