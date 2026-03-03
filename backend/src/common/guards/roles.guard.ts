import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('RolesGuard: No user found in request');
      throw new ForbiddenException('Access denied - authentication required');
    }

    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      this.logger.warn(`RolesGuard: User ${user.id} with role ${user.role} denied access. Required: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException('Access denied - insufficient permissions');
    }

    return true;

    if (!requiredRoles) {
      return true;
    }

    // Debug logging
    return requiredRoles.some((role) => user.role === role);
  }
}