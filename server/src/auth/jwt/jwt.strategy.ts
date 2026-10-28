import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'THIS_IS_A_FALLBACK_SECRET_CHANGE_ME_IN_PRODUCTION',
    });
  }

  async validate(payload: any) {
    // The payload contains id, username, email, role from login
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}
