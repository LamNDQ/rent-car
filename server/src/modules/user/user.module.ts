import { Module } from '@nestjs/common';
import { User, UserSchema } from './models/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers';
import { UserService } from './services';
import { UserRepository } from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
