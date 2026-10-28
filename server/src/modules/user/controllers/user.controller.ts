import {
  Body,
  Controller,
  Delete,
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
import { UserService } from '../services/user.service';
import { UserDto, UserLoginDto, UpdateUserDto } from '../models/dto/user.dto';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
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

import { Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller(USER_CONTROLLER_PATH)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
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

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE(id));
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

  private mapUser(user: any) {
    const userObj = user.toObject ? user.toObject() : user;
    return {
      ...userObj,
      id: userObj._id?.toString() || userObj.id,
    };
  }

  @Post(USER_LOGIN_PATH)
  async login(
    @Req() req: Request,
    @Body() credentials: UserLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`Login request headers: ${JSON.stringify(req.headers)}`);
    this.logger.log(`Login request body: ${JSON.stringify(credentials)}`);

    const user = await this.userService.validateCredentials(
      credentials.username,
      credentials.password,
    );

    if (!user) {
      throw new UnauthorizedException(USER_INVALID_CREDENTIALS_MESSAGE);
    }

    const payload = {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user._id,
    };
    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    this.logger.log(`Generated JWT Token: ${token}`);
    this.logger.log(`Generated Refresh Token: ${refreshToken}`);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user._id,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      const newPayload = {
        username: payload.username,
        email: payload.email,
        role: payload.role,
        id: payload.id,
      };
      const token = this.jwtService.sign(newPayload);

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      return { token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
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
      const newUser = await this.userService.create(data);
      return newUser;
    } catch (error: any) {
      // Catch specific errors or re-throw
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user.');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return await this.userService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.userService.delete(id);
    if (!deleted) {
      throw new NotFoundException(USER_NOT_FOUND_TO_DELETE_MESSAGE(id));
    }
    return;
  }
}
