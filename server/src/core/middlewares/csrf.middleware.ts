import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const CSRF_COOKIE_NAME = 'csrfToken';
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_TOKEN_TTL = 2 * 60 * 60 * 1000;

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function createCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function csrfCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: CSRF_TOKEN_TTL,
  };
}

function tokensMatch(cookieToken: unknown, headerToken: unknown): boolean {
  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    cookieToken.length === 0 ||
    cookieToken.length !== headerToken.length
  ) {
    return false;
  }

  return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  if (tokensMatch(req.cookies?.[CSRF_COOKIE_NAME], req.get(CSRF_HEADER_NAME))) {
    next();
    return;
  }

  res.status(403).json({
    statusCode: 403,
    message: 'Invalid or missing CSRF token',
    error: 'Forbidden',
  });
}
