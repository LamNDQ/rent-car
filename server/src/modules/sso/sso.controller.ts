import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { SsoService } from './sso.service';
import { ConfigService } from '@nestjs/config';
import { setAuthCookies } from '../../auth/auth.cookies';

@Controller('sso')
export class SsoController {
  constructor(
    private readonly ssoService: SsoService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const user = await this.ssoService.findOrCreateUser(req.user, 'google');
    await this.handleSsoCallback(user, res);
  }

  private async handleSsoCallback(user: any, res: Response) {
    const sessionId = await this.ssoService.createSession(user);
    const payload = {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user._id.toString(),
      sessionId,
    };

    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    setAuthCookies(res, token, refreshToken);

    const frontendUrl =
      this.configService.get<string>('CLIENT_URL') || 'http://localhost:4000';
    res.redirect(`${frontendUrl}/login/sso-success`);
  }
}
