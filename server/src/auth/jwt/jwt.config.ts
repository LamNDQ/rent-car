import { ConfigService } from '@nestjs/config';

export const JWT_SECRET_MIN_LENGTH = 32;

export function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET')?.trim();

  if (
    !secret ||
    secret.length < JWT_SECRET_MIN_LENGTH ||
    /change[_-]?me|fallback/i.test(secret)
  ) {
    throw new Error(
      'JWT_SECRET must be configured with at least 32 characters and must not use a default or fallback value. Generate one with: openssl rand -hex 32',
    );
  }

  return secret;
}
