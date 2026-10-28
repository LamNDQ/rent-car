import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, PassportModule, JwtModule],
  controllers: [SsoController],
  providers: [SsoService, GoogleStrategy],
})
export class SsoModule {}
