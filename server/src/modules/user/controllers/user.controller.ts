import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Req,
  Res,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserService } from '../services/user.service';
import { UserDto, UserLoginDto, UpdateUserDto } from '../models/dto/user.dto';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles/roles.guard';
import { Roles } from '../../../auth/roles/roles.decorator';
import {
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from '../../../auth/auth.cookies';
import { JwtService } from '@nestjs/jwt';
import {
  USER_CONTROLLER_PATH,
  USER_FIELD_EXISTS_MESSAGE,
  USER_INVALID_CREDENTIALS_MESSAGE,
  USER_LOGIN_PATH,
  USER_NOT_FOUND_MESSAGE,
  USER_NOT_FOUND_TO_DELETE_MESSAGE,
  USER_SEARCH_PATH,
} from '../constants';

import type { Request, Response } from 'express';

@Controller(USER_CONTROLLER_PATH)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((user) => this.mapUser(user));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@Req() req: any) {
    const user = await this.userService.findOneById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUser(user);
  }

  @Get(USER_SEARCH_PATH)
  async findOne(@Query('filter') filter: string) {
    const user = await this.userService.findOne({ username: filter });
    if (!user) {
      throw new NotFoundException(`User with username "${filter}" not found.`);
    }
    return this.mapUser(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE(id));
    }
    return this.mapUser(user);
  }

  private mapUser(user: any) {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.refreshSessionIds;
    return {
      ...userObj,
      id: userObj._id?.toString() || userObj.id,
    };
  }

  @Post(USER_LOGIN_PATH)
  async login(
    @Body() credentials: UserLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.validateCredentials(
      credentials.username,
      credentials.password,
    );

    if (!user) {
      throw new UnauthorizedException(USER_INVALID_CREDENTIALS_MESSAGE);
    }

    const sessionId = randomUUID();
    await this.userService.addRefreshSession(user._id.toString(), sessionId);

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

    return {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user._id.toString(),
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOneById(payload.id);

      if (
        !user ||
        !payload.sessionId ||
        !(user.refreshSessionIds ?? []).includes(payload.sessionId)
      ) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      const sessionId = randomUUID();
      await this.userService.replaceRefreshSession(
        user._id.toString(),
        payload.sessionId,
        sessionId,
      );

      const newPayload = {
        username: user.username,
        email: user.email,
        role: user.role,
        id: user._id.toString(),
        sessionId,
      };
      const token = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      setAuthCookies(res, token, newRefreshToken);

      return { token };
    } catch {
      clearAuthCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken);
        if (payload.id && payload.sessionId) {
          await this.userService.removeRefreshSession(
            payload.id,
            payload.sessionId,
          );
        }
      } catch {
        // Expired or invalid refresh token: only clear the cookies.
      }
    }

    clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  @Post()
  async create(@Body() data: UserDto) {
    try {
      const existingUser = await this.userService.findOne({
        username: data.username,
      });
      if (existingUser) {
        throw new BadRequestException(USER_FIELD_EXISTS_MESSAGE('Username'));
      }
      const existingEmail = await this.userService.findUserByEmail(data.email);
      if (existingEmail) {
        throw new BadRequestException(USER_FIELD_EXISTS_MESSAGE('Email'));
      }
      const newUser = await this.userService.create({
        ...data,
        role: 'normal',
      });
      return this.mapUser(newUser);
    } catch (error: any) {
      // Catch specific errors or re-throw
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user.');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
    @Req() req: any,
  ) {
    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?.id === id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('You can only update your own account');
    }

    if (!isAdmin && updateData.role !== undefined) {
      throw new ForbiddenException('Only admins can change roles');
    }

    const updatedUser = await this.userService.update(id, updateData);
    return this.mapUser(updatedUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const deleted = await this.userService.delete(id);
    if (!deleted) {
      throw new NotFoundException(USER_NOT_FOUND_TO_DELETE_MESSAGE(id));
    }
    return;
  }
}
