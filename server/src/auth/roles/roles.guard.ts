import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@modules/user/services/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;

      const user = await this.userService.findOne({
        _id: payload.id ?? payload.sub,
      });
      if (!user) {
        return false;
      }

      return this.validateUserRole(user.role, requiredRoles);
    } catch (error) {
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    return authHeader.replace('Bearer ', '');
  }

  private validateUserRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.some((role) => userRole === role);
  }
}
