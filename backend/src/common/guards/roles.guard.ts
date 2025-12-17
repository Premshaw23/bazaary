console.log('=== RolesGuard file loaded ===');
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('=== RolesGuard canActivate called ===');

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest();
    console.log('[RolesGuard DEBUG] req:', req);
    const { user } = req;
    console.log('[RolesGuard DEBUG] user:', user, 'requiredRoles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    // Debug logging
    return requiredRoles.some((role) => user.role === role);
  }
}