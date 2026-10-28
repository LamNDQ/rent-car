import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const appUrl =
      configService.get<string>('APP_URL') || 'http://localhost:3000';
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy_google_id',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') ||
        'dummy_google_secret',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        `${appUrl}/sso/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info: any) => void,
  ) {
    done(null, profile, undefined);
  }
}
