import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  CSRF_COOKIE_NAME,
  createCsrfToken,
  csrfCookieOptions,
} from '../core/middlewares/csrf.middleware';

@Controller('csrf')
export class CsrfController {
  @Get()
  getToken(@Res({ passthrough: true }) res: Response) {
    const csrfToken = createCsrfToken();

    res.setHeader('Cache-Control', 'no-store');
    res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions());

    return { csrfToken };
  }
}
