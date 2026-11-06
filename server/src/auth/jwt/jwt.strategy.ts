import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from '@modules/user/services/user.service';
import { ACCESS_TOKEN_COOKIE } from '../auth.cookies';
import { getJwtSecret } from './jwt.config';

interface JwtPayload {
  id: string;
  sessionId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.[ACCESS_TOKEN_COOKIE];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOneById(payload.id);

    if (
      !user ||
      !payload.sessionId ||
      !(user.refreshSessionIds ?? []).includes(payload.sessionId)
    ) {
      throw new UnauthorizedException('Session is invalid or has been revoked');
    }

    return {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
