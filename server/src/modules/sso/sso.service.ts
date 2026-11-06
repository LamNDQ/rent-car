import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserService } from '../user/services/user.service';
import { UserDocument } from '../user/models/schemas/user.schema';

@Injectable()
export class SsoService {
  constructor(private readonly userService: UserService) {}

  async findOrCreateUser(
    profile: any,
    provider: 'google',
  ): Promise<UserDocument> {
    void provider;
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('Email not found in provider profile');
    }

    let user = await this.userService.findUserByEmail(email);

    if (!user) {
      const providerId = profile.id;
      const username = `sso_google_${profile.id.substring(0, 10)}`;

      user = await this.userService.create({
        email,
        username,
        needsProfileSetup: true,
      });

      user = await this.userService.update(user._id.toString(), {
        googleId: providerId,
      });
    } else {
      const providerId = profile.id;
      if (!user.googleId) {
        user = await this.userService.update(user._id.toString(), {
          googleId: providerId,
        });
      }
    }

    if (!user) {
      throw new Error('User could not be found or created');
    }

    return user;
  }

  async createSession(user: UserDocument): Promise<string> {
    const sessionId = randomUUID();
    await this.userService.addRefreshSession(user._id.toString(), sessionId);
    return sessionId;
  }
}
