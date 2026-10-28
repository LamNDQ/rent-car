import { Controller, Get, UseGuards, Req, Res, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request, type Response } from 'express';
import { SsoService } from './sso.service';
import { ConfigService } from '@nestjs/config';

@Controller('sso')
export class SsoController {
  private readonly logger = new Logger(SsoController.name);

  constructor(
    private readonly ssoService: SsoService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const user = await this.ssoService.findOrCreateUser(req.user, 'google');
    return this.handleSsoCallback(user, res);
  }

  private async handleSsoCallback(user: any, res: Response) {
    const payload = {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user._id,
    };

    const token = this.jwtService.sign(payload);
    this.logger.log(`Generated SSO Token: ${token}`);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4000';
    res.redirect(`${frontendUrl}/login/sso-success?token=${token}`);
  }
}
