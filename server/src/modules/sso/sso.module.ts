import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [UserModule, PassportModule, AuthModule],
  controllers: [SsoController],
  providers: [SsoService, GoogleStrategy],
})
export class SsoModule {}
