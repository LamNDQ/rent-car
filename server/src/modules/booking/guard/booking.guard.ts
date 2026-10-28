import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// Demo Guard
@Injectable()
export class BookingGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    req.user = userId
      ? { id: userId, role: userRole ?? 'normal' }
      : { id: '665f1a2b3c4d5e6f7a8b9c01', role: 'vip' }; // demo fallback

    return true;
  }
}
